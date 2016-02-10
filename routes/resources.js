"use strict";

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Resources = require('../models/reslock');

/* GET categories listing */
router.get('/categories', function (req, res) {
    Resources.find().distinct('category')
    .then(function (resources) {
        res.json(resources);
    })
    .catch(function (err) {
        return next(err);
    });
});

/* GET groups listing */
router.get('/groups', function (req, res, next) {
    Resources.aggregate([{ $group : { _id : "$category", group: { $addToSet: "$group"} } }], function (err, resources) {
        if (err) {
            console.log(err);
        }
        res.json(resources);
    });
    /*
    .then(function (resources) {
        res.json(resources);
    })
    .catch(function (err) {
        return next(err);
    });*/
});

/* GET resources listing. */
router.get('/', function (req, res, next) {
    Resources.find()
    .then(function (resources) {
        res.json(resources);
    })
    .catch(function (err) {
        return next(err);
    });
});

router.get('/:id', function (req, res, next) {
    Resources.findById(req.params.id)
    .then(function (resources) {
        res.json(resources);
    })
    .catch(function (err) {
        return next(err);
    });
});

router.put('/:id', function (req, res, next) {
    Resources.findByIdAndUpdate(req.params.id, req.body)
    .then(function (resources) {
        res.json(resources);
    })
    .catch(function (err) {
        return next(err);
    });
});

router.delete('/:id', function (req, res, next) {
    Resources.findByIdAndRemove(req.params.id)
    .then(function (resources) {
        res.json(resources);
    })
    .catch(function (err) {
        return next(err);
    });
});

router.post('/', function (req, res, next) {
    Resources.create(req.body)
    .then(function (resources) {
        res.json(resources);
    })
    .catch(function (err) {
        return next(err);
    });
});

module.exports = router;