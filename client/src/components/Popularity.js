import React from 'react';
import './App.css';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import ImageList from './ImageList';

function Popularity() {

    const { loading, error, data } = useQuery(queries.GET_POP_IMAGE, {
        fetchPolicy: 'cache-and-network'
    });

    var info = {
        data: data,
        route: "Popularity"
    }

    if (data) {
        const { getTopTenBinnedPosts } = data;
        let counter = 0;
        getTopTenBinnedPosts.map((getTopTenBinnedPost) => {
            counter = counter + getTopTenBinnedPost.numBinned;
        })
        return (
            <div>
                <div className="upload-div">
                    <h2>Your taste is: {counter >= 200 ? 'Mainstream' : 'Non-mainstream'}</h2>
                    <h3>Here are the top 10 popular posts you added to your bin:</h3>
                </div>
                <ImageList info={info}></ImageList>
            </div>
        )
    } else if (loading) {
        return <div className="loading"> Loading... </div>;
    } else if (error) {
        return <div> {error.message} </div>
    }

};

export default Popularity;