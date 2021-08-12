import React from 'react';
import './App.css';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import ImageList from './ImageList';

function MyBin() {

    const { loading, error, data } = useQuery(queries.GET_BIN_IMAGE, {
        fetchPolicy: 'cache-and-network'
    });

    var info = {
        data: data,
        route: "MyBin"
    }

    if (data) {
        return (
            <div>
                <div className="upload-div">
                    <h2>Here are the posts you added to your bin:</h2>
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

export default MyBin;