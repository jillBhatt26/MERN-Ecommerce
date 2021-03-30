// hooks
import { useEffect, useState, useContext } from 'react';

// dependencies
import axios from 'axios';
import Compressor from 'compressorjs';

// context
import { AppContext } from '../contexts/AppContext';

const AddProduct = ({ setIsModalOpen }) => {
    const [thumbnailURL, setThumbnailURL] = useState(null);
    const [selectedImagesURL, setSelectedImagesURL] = useState([]);

    // submit form fields
    const [thumbnail, setThumbnail] = useState(null);
    const [images, setImages] = useState([]);
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [category, setCategory] = useState('');
    const [mrp, setMrp] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');

    // compressed images and thumbnail
    const [compThumbnail, setCompThumbnail] = useState(null);
    const [compImages, setCompImages] = useState([]);

    // context
    const { dispatchProduct } = useContext(AppContext);

    // for the materialize css select init
    useEffect(() => {
        const M = window.M;

        M.AutoInit();
    }, []);

    const HandleThumbnailChange = event => {
        setThumbnail(event.target.files[0]);

        const thumbnailImg = event.target.files[0];

        if (thumbnailImg) {
            const thumbnailURL = URL.createObjectURL(thumbnailImg);

            setThumbnailURL(thumbnailURL);
        }
    };

    const renderThumbnail = src => {
        return (
            <img
                src={src}
                key={src}
                alt="product thumbnail"
                className="add-product-preview-img"
            />
        );
    };

    const ImageHandleChange = event => {
        // console.log(event.target.files);
        if (event.target.files) {
            const fileArray = Array.from(event.target.files).map(file =>
                URL.createObjectURL(file)
            );

            // preserve the previous state
            setSelectedImagesURL(prevImages => prevImages.concat(fileArray));
            setImages(prevImages => prevImages.concat(event.target.files));

            // if page is refreshed
            Array.from(event.target.files).map(file =>
                URL.revokeObjectURL(file)
            );
        }
    };

    const renderImages = source => {
        return source.map(image => (
            <img
                src={image}
                key={image}
                alt="preview"
                className="add-product-preview-img"
            />
        ));
    };

    const HandleAddProduct = event => {
        event.preventDefault();

        if (
            name &&
            manufacturer &&
            category &&
            mrp &&
            sellPrice &&
            quantity &&
            description &&
            compThumbnail &&
            compImages.length > 0
        ) {
            const formData = new FormData();

            formData.append('thumbnail', compThumbnail, 'thumbnail.jpg');

            compImages.forEach((img, index) => {
                formData.append(`img_${index}`, img, `img_${index}.jpg`);
            });

            formData.append('name', name);
            formData.append('manufacturer', manufacturer);
            formData.append('category', category);
            formData.append('mrp', mrp);
            formData.append('sell_price', sellPrice);
            formData.append('quantity', quantity);
            formData.append('description', description);

            // send the request using axios
            axios
                .post('http://localhost:5000/product/add', formData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                .then(res => {
                    console.log(res.data);

                    // dispatch an action to store the newly added product from response in the state ie. reducer.
                    // NOTE: Update the payload object to just one array. Also update the product reducer
                    dispatchProduct({
                        type: 'NEW_PRODUCT',
                        payload: { newProduct: res.data.newProduct }
                    });

                    setIsModalOpen(false);

                    return false;
                })
                .catch(err => {
                    console.log(err);
                    return false;
                });

            return false;
        } else {
            alert('All fields required!');

            return false;
        }
    };

    useEffect(() => {
        // compress the thumbnail
        if (thumbnail) {
            new Compressor(thumbnail, {
                quality: 0.6,
                success: result => {
                    // 1.1 Store the compressed image in the state
                    setCompThumbnail(result);
                }
            });
        }

        if (images.length) {
            // compress all the images
            const productImgs = images[0];

            Object.entries(productImgs).forEach(img => {
                const productImage = img[1];

                new Compressor(productImage, {
                    quality: 0.6,
                    // 2.1 Store the compressed images in the store
                    success: result => {
                        setCompImages(prevImages => prevImages.concat(result));
                    }
                });
            });
        }
    }, [images, thumbnail]);

    return (
        <div className="container">
            <div className="row">
                <h5 className="center mt-3">Product Information</h5>
                <form autoComplete="off" onSubmit={HandleAddProduct}>
                    <div className="input-field col s12 m6 offset-m3">
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="input-field col s12 m6 offset-m3">
                        <input
                            type="text"
                            placeholder="Product Manufacturer"
                            value={manufacturer}
                            onChange={e => setManufacturer(e.target.value)}
                        />
                    </div>

                    <div className="input-field col s12 m6 offset-m3">
                        <select
                            name="categories"
                            defaultValue={'DEFAULT'}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="DEFAULT" disabled>
                                Product Category
                            </option>
                            <option value="fashion">Fashion</option>
                            <option value="sports">Sports</option>
                            <option value="electronics">
                                Electronic Accessories
                            </option>
                            <option value="phones">
                                SmartPhones and Gadgets
                            </option>
                            <option value="pets">Pets</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="home">Home</option>
                            <option value="kitchen">Kitchen</option>
                        </select>
                    </div>

                    <div className="input-field col s12 m6 offset-m3">
                        <input
                            type="text"
                            placeholder="Product MRP"
                            value={mrp}
                            onChange={e => setMrp(e.target.value)}
                        />
                    </div>

                    <div className="input-field col s12 m6 offset-m3">
                        <input
                            type="text"
                            placeholder="Selling Price"
                            value={sellPrice}
                            onChange={e => setSellPrice(e.target.value)}
                        />
                    </div>

                    <div className="input-field col s12 m6 offset-m3">
                        <input
                            type="number"
                            min="1"
                            placeholder="Product Quantity"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                        />
                    </div>

                    <div className="input-field col s12 m6 offset-m3">
                        <textarea
                            className="materialize-textarea"
                            placeholder="Product Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="file-field input-field col s12 m6 offset-m3">
                        <div className="btn">
                            <span>Image</span>
                            <input
                                type="file"
                                onChange={HandleThumbnailChange}
                            />
                        </div>
                        <div className="file-path-wrapper">
                            <input
                                className="file-path validate"
                                type="text"
                                placeholder="Product Thumbnail"
                            />
                        </div>
                    </div>

                    {thumbnailURL && (
                        <div className="result">
                            {renderThumbnail(thumbnailURL)}
                        </div>
                    )}

                    <div className="file-field input-field col s12 m6 offset-m3">
                        <div className="btn">
                            <span>Images</span>
                            <input
                                type="file"
                                multiple
                                onChange={ImageHandleChange}
                            />
                        </div>
                        <div className="file-path-wrapper">
                            <input
                                className="file-path validate"
                                type="text"
                                placeholder="Product Images"
                            />
                        </div>
                    </div>

                    <div className="result">
                        {renderImages(selectedImagesURL)}
                    </div>

                    <div className="center col s12 m4 offset-m4 mt-3">
                        <button className="btn-flat white-text waves-effect waves-dark blue darken-3">
                            <i className="material-icons right">add</i>
                            add product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
