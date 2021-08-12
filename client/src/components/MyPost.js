import React from 'react';
import './App.css';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import ImageList from './ImageList';

function MyPost() {

    const { loading, error, data } = useQuery(queries.GET_POST_IMAGE, {
        fetchPolicy: 'cache-and-network'
    })

    var info = {
        data: data,
        route: "MyPost"
    }

    if (data) {
        return (
            <div>
                <br />
                <div className="upload-div">
                    <a href="/new-post">
                        <button className="button upload-button" >Upload a post</button>
                    </a>
                </div>
                <br />
                <ImageList info={info}></ImageList>
            </div>
        )
    } else if (loading) {
        return <div className="loading"> Loading... </div>;
    } else if (error) {
        return <div> {error.message} </div>
    }
};

export default MyPost;