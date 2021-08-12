import React, { useState } from 'react';
import './App.css';
import { useQuery } from '@apollo/client';
import queries from '../queries';
import ImageList from './ImageList';

function Home() {

    const [pageNum, setPageNum] = useState(1);
    const { loading, error, data } = useQuery(queries.GET_UNSPLASH_IMAGE, {
        variables: { pageNum: pageNum },
    });

    var info = {
        data: data,
        route: "Home"
    }

    if (data) {
        return (
            <div>
                <br />
                <div className="upload-div">
                    <button className="button upload-button" onClick={() => setPageNum(pageNum + 1)}> Get More </button>
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

export default Home;