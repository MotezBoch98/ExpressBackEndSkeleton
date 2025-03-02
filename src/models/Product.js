import mongoose from 'mongoose';

/**
 * Product Schema
 * 
 * @typedef {Object} Product
 * @property {string} title - The title of the product. Required. Max length 100 characters.
 * @property {string} description - The description of the product. Required. Max length 2000 characters.
 * @property {number} price - The price of the product. Required. Must be a non-negative number.
 * @property {string} category - The category of the product. Required. Must be one of 'Goods', 'Food', 'Drink', 'Other'.
 * @property {number} stock - The stock quantity of the product. Required. Must be a non-negative number. Default is 0.
 * @property {Array.<{url: string}>} images - An array of image objects. Each image object must have a 'url' property which is required.
 * @property {number} ratings - The average rating of the product. Default is 0.
 * @property {number} numReviews - The number of reviews for the product. Default is 0.
 * @property {boolean} featured - Indicates if the product is featured. Default is false.
 * @property {Date} createdAt - The date when the product was created. Automatically generated.
 * @property {Date} updatedAt - The date when the product was last updated. Automatically generated.
 */
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxLength: [100, 'Product title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxLength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Goods', 'Food', 'Drink', 'Other'],
            message: 'Please select a valid category'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    images: [{
        url: {
            type: String,
            required: false,
            default: ""
        }
    }],
    ratings: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

productSchema.methods = {
    /**
     * Updates the average rating of the product.
     * 
     * @function updateAverageRating
     * @memberof Product
     * @instance
     * @param {number} newRating - The new rating to be added.
     * @returns {Promise<Product>} The updated product document.
     */
    updateAverageRating: function (newRating) {
        this.ratings = ((this.ratings * this.numReviews) + newRating) / (this.numReviews + 1);
        this.numReviews += 1;
        return this.save();
    },

    /**
     * Checks if the product is in stock.
     * 
     * @function isInStock
     * @memberof Product
     * @instance
     * @returns {boolean} True if the product is in stock, false otherwise.
     */
    isInStock: function () {
        return this.stock > 0;
    },

    /**
     * Applies a discount to the product price.
     * 
     * @function applyDiscount
     * @memberof Product
     * @instance
     * @param {number} percentageOff - The percentage of the discount to be applied.
     * @throws {Error} If the discount percentage is invalid.
     * @returns {number} The discounted price.
    */
    applyDiscount: function (percentageOff) {
        if (percentageOff < 0 || percentageOff > 100) {
            throw new Error('Invalid discount percentage');
        }
        const discountedPrice = this.price * (1 - percentageOff / 100);
        return Number(discountedPrice.toFixed(2));
    },

    /**
     * Formats the product price.
     * 
     * @function formatPrice
     * @memberof Product
     * @instance
     * @param {string} [currency='USD'] - The currency in which to format the price.
     * @returns {string} The formatted price.
    */
    formatPrice: function (currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(this.price);
    },

    /**
     * Gets the stock status of the product.
     * 
     * @function getStockStatus
     * @memberof Product
     * @instance
     * @returns {string} The stock status ('Out of Stock', 'Low Stock', 'In Stock').
    */
    getStockStatus: function () {
        if (this.stock === 0) return 'Out of Stock';
        if (this.stock < 5) return 'Low Stock';
        return 'In Stock';
    },

    /**
     * Adds a review to the product.
     * 
     * @function addReview
     * @memberof Product
     * @instance
     * @param {Object} review - The review object containing rating and comment.
     * @returns {Promise<Product>} The updated product document.
     */
    addReview: function (review) {
        this.reviews.push(review);
        return this.updateAverageRating(review.rating);
    },

    /**
     * Removes a review from the product.
     * 
     * @function removeReview
     * @memberof Product
     * @instance
     * @param {string} reviewId - The ID of the review to be removed.
     * @returns {Promise<Product>} The updated product document.
     */
    removeReview: function (reviewId) {
        const reviewIndex = this.reviews.findIndex(review => review._id.toString() === reviewId);
        if (reviewIndex !== -1) {
            const [removedReview] = this.reviews.splice(reviewIndex, 1);
            this.numReviews -= 1;
            this.ratings = this.numReviews > 0 ? 
                ((this.ratings * (this.numReviews + 1)) - removedReview.rating) / this.numReviews : 0;
            return this.save();
        }
        throw new Error('Review not found');
    }
};

productSchema.statics = {
    /**
     * Finds all featured products.
     * 
     * @function findFeatured
     * @memberof Product
     * @static
     * @returns {Promise<Array<Product>>} An array of featured products.
    */
    findFeatured: function () {
        return this.find({ featured: true });
    },

    /**
     * Finds products by category.
     * 
     * @function findByCategory
     * @memberof Product
     * @static
     * @param {string} category - The category to search for.
     * @returns {Promise<Array<Product>>} An array of products in the specified category.
     */
    findByCategory: function (category) {
        return this.find({ category });
    },

    /**
     * Searches products by title.
     * 
     * @function searchByTitle
     * @memberof Product
     * @static
     * @param {string} title - The title to search for.
     * @returns {Promise<Array<Product>>} An array of products matching the title.
     */
    searchByTitle: function (title) {
        return this.find({ title: new RegExp(title, 'i') });
    }
};

export default mongoose.model('Product', productSchema);