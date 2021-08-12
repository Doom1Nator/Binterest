const { ApolloServer, gql } = require('apollo-server');
const lodash = require('lodash');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const bluebird = require('bluebird');
const redis = require('redis');
const client = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

async function fetchApiData(pageNum) {
    if (pageNum <= 0) {
        throw 'pageNum should be positive'
    }
    const accessKey = '8IFqrg0GZG9sGiFqns0iMgmWB2uA_skqAhcsYPDrCn4'
    const url = 'https://api.unsplash.com/photos/?client_id=' + accessKey + '&page=' + pageNum;
    const binRawData = await client.ZREVRANGEAsync('Bin', 0, -1);
    const binData = binRawData === null ? [] : dataParser(binRawData);
    try {
        const { data } = await axios.get(url);
        let modifiedData = [];
        data.map((singleImg) => {
            let modifiedSingleData = {
                id: singleImg.id,
                url: singleImg.urls.regular,
                posterName: singleImg.user.name,
                description: singleImg.description,
                userPosted: false,
                binned: false,
                numBinned: singleImg.likes
            }
            binData.map((imgPost) => {
                if (imgPost.id === modifiedSingleData.id) {
                    modifiedSingleData.binned = true;
                }
            })
            modifiedData.push(modifiedSingleData);
        })
        return modifiedData;
    } catch (e) {
        console.log(e);
    }
}

const typeDefs = gql`
    type Query{
        unsplashImages(pageNum: Int): [ImagePost]
        binnedImages: [ImagePost]
        userPostedImages: [ImagePost]
        getTopTenBinnedPosts: [ImagePost]
    }

    type ImagePost {
        id: ID!
        url: String!
        posterName: String!
        description: String
        userPosted: Boolean!
        binned: Boolean!
        numBinned: Int!
    }

    type Mutation {
        uploadImage(
            url: String!,
            description: String,
            posterName: String
        ): ImagePost
        updateImage(
            id: ID!,
            url: String, 
            posterName: String, 
            description: String, 
            userPosted: Boolean, 
            binned: Boolean,
            numBinned: Int
        ): ImagePost
        deleteImage(id: ID!, binned: Boolean): ImagePost 
        # It is necessary to add 'binned', because we need to check a post being deleted is binned or not.
        # Without this checking, will trigger some bugs
    }
`;

const dataParser = (rawData) => {
    let data = [];
    rawData.map((singlePost) => {
        parsedSinglePost = JSON.parse(singlePost);
        data.push(parsedSinglePost);
    });
    return data;
}

const resolvers = {
    Query: {
        unsplashImages: (_, args) => fetchApiData(args.pageNum),
        binnedImages: async () => {
            const rawData = await client.ZREVRANGEAsync('Bin', 0, -1);
            return dataParser(rawData);
        },
        userPostedImages: async () => {
            const rawData = await client.ZREVRANGEAsync('Post', 0, -1);
            return dataParser(rawData);
        },
        getTopTenBinnedPosts: async () => {
            const rawData = await client.ZREVRANGEAsync('Bin', 0, 9);
            return dataParser(rawData);
        }
    },
    Mutation: {
        uploadImage: async (_, args) => {
            let imageUploading = {
                id: uuidv4(),
                url: args.url,
                posterName: args.posterName,
                description: args.description,
                userPosted: true,
                binned: false,
                numBinned: 0
            };
            const jsonImg = JSON.stringify(imageUploading);
            await client.ZADDAsync('Post', imageUploading.numBinned, jsonImg);
            return imageUploading;
        },
        updateImage: async (_, args) => {
            let imageUpdating = {
                id: args.id,
                url: args.url,
                posterName: args.posterName,
                description: args.description,
                userPosted: args.userPosted,
                binned: args.binned,
                numBinned: args.numBinned
            };

            if (args.binned === true) {
                let oldPost = {
                    id: args.id,
                    url: args.url,
                    posterName: args.posterName,
                    description: args.description,
                    userPosted: args.userPosted,
                    binned: false,
                    numBinned: args.numBinned
                }
                imageUpdating.numBinned = imageUpdating.numBinned + 1;
                const jsonImg = JSON.stringify(imageUpdating);
                await client.ZADDAsync('Bin', imageUpdating.numBinned, jsonImg);
                if (args.userPosted === true) {
                    await client.ZREMAsync('Post', JSON.stringify(oldPost));
                    await client.ZADDAsync('Post', imageUpdating.numBinned, jsonImg);
                }
            } else if (args.binned === false) {
                let oldPost = {
                    id: args.id,
                    url: args.url,
                    posterName: args.posterName,
                    description: args.description,
                    userPosted: args.userPosted,
                    binned: true,
                    numBinned: args.numBinned
                }
                imageUpdating.binned = true;
                /*Set binned to true, 
                so we can remove it from Redis, 
                otherwise the binned field doesn't match*/
                const toDeleteFromBin = JSON.stringify(imageUpdating);
                imageUpdating.numBinned = imageUpdating.numBinned - 1;
                await client.ZREMAsync('Bin', toDeleteFromBin);
                /*Reset binned to false to store in post*/
                imageUpdating.binned = false;
                const toAddTOPost = JSON.stringify(imageUpdating);
                if (args.userPosted === true) {
                    await client.ZREMAsync('Post', JSON.stringify(oldPost));
                    await client.ZADDAsync('Post', imageUpdating.numBinned, toAddTOPost);
                }
            }

            return imageUpdating;
        },
        deleteImage: async (_, args) => {
            const rawData = await client.ZREVRANGEAsync('Post', 0, -1);
            const cacheData = dataParser(rawData);
            const targetData = cacheData.filter((e) => e.id === args.id)[0];
            await client.ZREMAsync('Post', JSON.stringify(targetData));
            if (args.binned === true) {
                const binRawData = await client.ZREVRANGEAsync('Bin', 0, -1);
                const cacheBinData = dataParser(binRawData);
                const targetBinData = cacheBinData.filter((e) => e.id === args.id)[0];
                await client.ZREMAsync('Bin', JSON.stringify(targetBinData));
                targetBinData.userPosted = false;
                await client.ZADDAsync('Bin', targetBinData.numBinned, JSON.stringify(targetBinData));
            }
            return targetData;
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url} 🚀`)
});


