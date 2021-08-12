import React from 'react';
import './App.css';
import { useMutation } from '@apollo/client';
import queries from '../queries';

function NewPost() {

    const [createPost] = useMutation(queries.UPLOAD_IMAGE);

    let url;
    let description;
    let posterName;
    let body = null;
    let valid = true;

    const checkImgValid = (node) => {
        var imageObj = new Image();
        imageObj.src = node;
        imageObj.onerror = () => {
            valid = false;
        }
        imageObj.onload = () => {
            console.log('onload fired')
            if (imageObj.width > 0 && imageObj.height > 0) {
                valid = true;
            } else {
                valid = false;
            }
        }
    }

    body = (
        <form className="form" onSubmit={(e) => {
            e.preventDefault();
            checkImgValid(url.value);
            setTimeout(() => {
                console.log(valid);
                if (valid) {
                    createPost({
                        variables: {
                            url: url.value,
                            description: description.value,
                            posterName: posterName.value
                        }
                    });
                    alert('Post Created')
                } else {
                    alert('Invalid image url');
                }
            }, 1000);
          
        }}>
            <br />
            <div className="form-group">
                <label>Url:
                    <br />
                    <textarea className="textarea-url" ref={(node) => {
                        url = node;
                    }}
                        required
                        autoFocus={true}
                    />
                </label>
            </div>
            <br />
            <div className="form-group">
                <label>Description:
                    <br />
                    <textarea className="textarea-description" ref={(node) => {
                        description = node;
                    }}
                    />
                </label>
            </div>
            <br />
            <div className="form-group">
                <label>Poster:
                    <br />
                    <input ref={(node) => {
                        posterName = node;
                    }}
                    />
                </label>
            </div>
            <br />
            <button className="button add-button" type="submit">
                Create Post
            </button>
        </form>
    )


    return (
        <div>
            {body}
        </div>
    )
};

export default NewPost;