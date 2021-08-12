import { gql } from '@apollo/client';

const GET_UNSPLASH_IMAGE = gql`
    query getUnsplashImage($pageNum: Int){
        unsplashImages(pageNum: $pageNum){
            id
            url
            posterName
            description
            userPosted
            binned
            numBinned
        }
    }
`;

const GET_BIN_IMAGE = gql`
    query{
        binnedImages{
            id
            url
            posterName
            description
            userPosted
            binned
            numBinned
        }
    }
`

const GET_POST_IMAGE = gql`
    query{
        userPostedImages{
            id
            url
            posterName
            description
            userPosted
            binned
            numBinned
        }
    }
`

const GET_POP_IMAGE = gql`
    query{
        getTopTenBinnedPosts{
            id
            url
            posterName
            description
            userPosted
            binned
            numBinned
        }
    }
`

const UPLOAD_IMAGE = gql`
    mutation uploadImage(
        $url: String!
        $description: String
        $posterName: String
        ){
            uploadImage(
                url: $url
                description: $description
                posterName: $posterName
            ){
                id
                url
                posterName
                description
                userPosted
                binned
                numBinned
            }

    }
`

const UPDATE_IMAGE = gql`
    mutation updateImage(
        $id: ID!,
        $url: String, 
        $posterName: String, 
        $description: String, 
        $userPosted: Boolean, 
        $binned: Boolean
        $numBinned: Int,
        ){
            updateImage(
                id: $id
                url: $url
                posterName: $posterName
                description: $description
                userPosted: $userPosted
                binned: $binned
                numBinned: $numBinned
        ){
            id
        }
    }
`

const DELETE_POST = gql`
    mutation deletePost($id: ID!, $binned: Boolean){
        deleteImage(id: $id binned: $binned){
            id
        }
    }
`

export default {
    GET_UNSPLASH_IMAGE,
    GET_BIN_IMAGE,
    GET_POST_IMAGE,
    GET_POP_IMAGE,
    UPLOAD_IMAGE,
    UPDATE_IMAGE,
    DELETE_POST
};