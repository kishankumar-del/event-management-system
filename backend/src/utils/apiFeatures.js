/**
 * Utility class for Mongoose query manipulation:
 * Handles multi-field search, filtering, sorting, and server-side pagination.
 */
class APIFeatures {
  /**
   * @param {object} mongooseQuery - Mongoose query (e.g. Event.find())
   * @param {object} queryString - Express req.query
   */
  constructor(mongooseQuery, queryString = {}) {
    this.query = mongooseQuery;
    this.queryString = queryString;
    this.paginationMeta = {
      page: 1,
      limit: 10,
    };
  }

  /**
   * Apply keyword search across specified model fields using case-insensitive regex
   * @param {Array<string>} searchFields - Fields to search against
   */
  search(searchFields = ['title', 'name']) {
    if (this.queryString.search && this.queryString.search.trim() !== '') {
      const keyword = this.queryString.search.trim();
      const searchConditions = searchFields.map((field) => ({
        [field]: { $regex: keyword, $options: 'i' },
      }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  /**
   * Apply field filters with MongoDB operators ($gte, $gt, $lte, $lt, $in)
   * @param {Array<string>} excludedFields - Query parameters reserved for control
   */
  filter(excludedFields = ['page', 'sort', 'limit', 'fields', 'search']) {
    const queryObj = { ...this.queryString };
    excludedFields.forEach((el) => delete queryObj[el]);

    // Clean up empty string values
    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] === '' || queryObj[key] === undefined) {
        delete queryObj[key];
      }
    });

    // Advance filtering: replace gte, gt, lte, lt with $gte, $gt, etc.
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Apply sorting: converts comma-separated list into space-separated string
   * @param {string} defaultSort - Default sort if query string does not specify
   */
  sort(defaultSort = '-createdAt') {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }

  /**
   * Apply pagination with strict limits to prevent denial of service
   * Standardizes page and limit
   */
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(this.queryString.limit, 10) || 10));
    const skip = (page - 1) * limit;

    this.paginationMeta.page = page;
    this.paginationMeta.limit = limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;

