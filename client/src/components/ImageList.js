import React, { useState } from 'react';
import './App.css';
import { useMutation } from '@apollo/client';
import queries from '../queries';
import noImage from '../no_image.jpeg'
import { Card, CardContent, CardMedia, Grid, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    card: {
        maxWidth: 550,
        height: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 5,
        border: '1px solid #1e8678',
        boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);',
        textAlign: 'center'

    },
    titleHead: {
        borderBottom: '1px solid #1e8678',
        fontWeight: 'bold'
    },
    grid: {
        flexGrow: 1,
        flexDirection: 'row'
    },
    media: {
        height: '100%',
        width: '100%'
    },
    button: {
        color: '#1e8678',
        fontWeight: 'bold',
        fontSize: 12
    }
});


function ImageList(props) {
    const classes = useStyles();
    const data = props.info.data;
    const route = props.info.route;
    let card = null;
    let button = null;

    const [addToBin] = useMutation(queries.UPDATE_IMAGE);
    const [removingPostId, setRemovingPostId] = useState('1');
    const [removeFromBin] = useMutation(queries.UPDATE_IMAGE, {
        update(cache, { data: { removeFromBin } }) {
            const { binnedImages } = cache.readQuery({
                query: queries.GET_BIN_IMAGE
            });
            let removingPostIdUpdated = null;
            setRemovingPostId((state) => {
                removingPostIdUpdated = state;
                //The setState won't change the state immediately, so have to add this to get the data we want
            })
            console.log(removingPostIdUpdated);
            cache.writeQuery({
                query: queries.GET_BIN_IMAGE,
                data: {
                    binnedImages: binnedImages.filter((e) => e.id !== removingPostIdUpdated)
                }
            })
        }
    });
    const [deletingPostId, setDeletingPostId] = useState('1');
    const [deletePost] = useMutation(queries.DELETE_POST, {
        update(cache, { data: { deletePost } }) {
            const { userPostedImages } = cache.readQuery({
                query: queries.GET_POST_IMAGE
            });
            let deletingPostIdUpdated = null;
            setDeletingPostId((state) => {
                deletingPostIdUpdated = state;
                //The setState won't change the state immediately, so have to add this to get the data we want
            })
            cache.writeQuery({
                query: queries.GET_POST_IMAGE,
                data: {
                    userPostedImages: userPostedImages.filter((e) => e.id !== deletingPostIdUpdated)
                }
            })
        }
    });

    const buildCard = (imgPost) => {
        return (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={imgPost.id} >
                <Card className={classes.card} variant='outlined' >
                    <CardMedia className={classes.media}
                        component='img'
                        image={imgPost && imgPost.url ? imgPost.url : noImage}
                        title='image'
                    />
                    <CardContent>
                        <Typography className={classes.titleHead}
                            gutterBottom variant='h6'
                            component='h3' >
                            {imgPost.description ? imgPost.description : 'No Description   '}
                        </Typography>
                        <Typography variant='body2'
                            color='textSecondary'
                            component='p' >
                            An image by: {imgPost && imgPost.posterName ? imgPost.posterName : 'No author'}
                        </Typography>
                    </CardContent >
                    {button}
                </Card >
            </Grid>
        )
    }

    const pushToBin = (imgPost) => {
        try {
            addToBin({
                variables: {
                    id: imgPost.id,
                    url: imgPost.url,
                    description: imgPost.description,
                    posterName: imgPost.posterName,
                    binned: true,
                    userPosted: imgPost.userPosted,
                    numBinned: imgPost.numBinned
                }
            })
            alert('Added to bin');
        } catch (e) {
            console.log(e);
            alert('Add to bin failed')
        }

    };


    const deleteFromBin = (imgPost) => {
        try {
            setRemovingPostId(imgPost.id);
            removeFromBin({
                variables: {
                    id: imgPost.id,
                    url: imgPost.url,
                    description: imgPost.description,
                    posterName: imgPost.posterName,
                    binned: false,
                    userPosted: imgPost.userPosted,
                    numBinned: imgPost.numBinned
                }
            })
            alert('Removed from bin');
        } catch (e) {
            console.log(e);
            alert('Bin deletion failed')
        }

    };

    const deleteFromMyPost = (imgPost) => {
        try {
            setDeletingPostId(imgPost.id);
            deletePost({
                variables: {
                    id: imgPost.id,
                    binned: imgPost.binned
                }
            })
            alert('Post deleted');
        } catch (e) {
            console.log(e);
            alert('Post deletion failed');
        }

    };

    const buildHomeButton = (imgPost) => {
        if (imgPost.binned === false) {
            return (
                <button className={'button add-button'} onClick={() => { pushToBin(imgPost); window.location.reload() }
                }>
                    Add to bin
                </button >
            )
        } else {
            return (
                <button className={'button add-button'} onClick={() => { deleteFromBin(imgPost); window.location.reload() }
                }>
                    Remove from bin
                </button >
            )
        }
    };

    const buildBinButton = (imgPost) => {
        return (
            <button className={'button add-button'} onClick={() => deleteFromBin(imgPost)}>
                Remove from bin
            </button>
        )
    };

    const buildPopButton = (imgPost) => {
        return (
            <button className={'button add-button'} onClick={() => { deleteFromBin(imgPost); window.location.reload() }}>
                Remove from bin
            </button>
        )
    };

    const buildPostButton = (imgPost) => {
        if (imgPost.binned === false) {
            return (
                <div>
                    <button className={'button add-button'} onClick={() => { pushToBin(imgPost); window.location.reload() }}>
                        Add to bin
                    </button>
                    <button className={'delete-button'} onClick={() => deleteFromMyPost(imgPost)}>
                        Delete Post
                </button>
                </div >
            )
        } else {
            return (
                <div>
                    <button className={'button add-button'} onClick={() => { deleteFromBin(imgPost); window.location.reload() }}>
                        Remove from bin
                    </button>
                    <button className={'delete-button'} onClick={() => deleteFromMyPost(imgPost)}>
                        Delete Post
                </button>
                </div >
            )
        }
    }

    if (route === 'Home') {
        const { unsplashImages } = data;
        card = data && unsplashImages && unsplashImages.map((unsplashImage) => {
            button = buildHomeButton(unsplashImage);
            return buildCard(unsplashImage);
        })
    } else if (route === 'MyBin') {
        const { binnedImages } = data;
        card = data && binnedImages && binnedImages.map((binnedImage) => {
            button = buildBinButton(binnedImage);
            return buildCard(binnedImage);
        })
    } else if (route === 'MyPost') {
        const { userPostedImages } = data;
        card = data && userPostedImages && userPostedImages.map((userPostedImage) => {
            button = buildPostButton(userPostedImage);
            return buildCard(userPostedImage);
        })
    } else if (route === 'Popularity') {
        const { getTopTenBinnedPosts } = data;
        card = data && getTopTenBinnedPosts && getTopTenBinnedPosts.map((getTopTenBinnedPost) => {
            button = buildPopButton(getTopTenBinnedPost);
            return buildCard(getTopTenBinnedPost);
        })
    } else {
        return <div>Error</div>
    }

    return (
        <div>
            <Grid container className={classes.grid} spacing={5}>
                {card}
            </Grid>
        </div >
    )

};

export default ImageList;