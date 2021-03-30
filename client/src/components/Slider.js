import { useState } from 'react';

// import icons
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';

const Slider = ({ images, product }) => {
    const [current, setCurrent] = useState(0);

    // get total images count
    const length = images.length;

    // next image function
    const nextImage = () => {
        setCurrent(current === length - 1 ? 0 : current + 1);
    };

    // const previous image function
    const previousImage = () => {
        setCurrent(current === 0 ? length - 1 : current - 1);
    };

    // check if images are provided
    if (!Array.isArray(images) || images.length < 0) {
        return null;
    }

    return (
        <section className="slider">
            <FaArrowAltCircleLeft
                className="left-arrow"
                onClick={previousImage}
            />
            <FaArrowAltCircleRight
                className="right-arrow"
                onClick={nextImage}
            />

            {images.map((image, index) => {
                return (
                    <div
                        className={index === current ? 'slide active' : 'slide'}
                        key={index}
                    >
                        {index === current && (
                            <img
                                key={image}
                                src={`../uploads/${product.seller_id}/${product._id}/${image}`}
                                alt="product pics"
                                className="slider-image"
                            />
                        )}
                    </div>
                );
            })}
        </section>
    );
};

export default Slider;
