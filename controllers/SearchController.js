const { Op } = require("sequelize");

const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;
const Class = require("../models").Class;
const Center = require("../models").Center;


class SearchController {
    searchStudent = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Student.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "userId"],
                limit: 20
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            return res.status(200).json([])
        }
    }

    searchParent = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Parent.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "userId"],
                limit: 20
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            return res.status(200).json([])
        }
    }

    searchTeacher = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Teacher.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "userId"],
                limit: 20
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            return res.status(200).json([])
        }
    }

    searchClass = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Class.findAll({
                where: {
                    code: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "code"],
                limit: 20
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            return res.status(200).json([])
        }
    }

    searchCenter = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Center.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "address"],
                limit: 20
            });

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            return res.status(200).json([])
        }
    }
}

module.exports = new SearchController();