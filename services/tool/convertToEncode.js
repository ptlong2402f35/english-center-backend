const { parentUpdateService } = require("../parent/parentUpdateService");
const { AesService } = require("../security/AesService");

const Parent = require("../../models").Parent;
const User = require("../../models").User;
const Student = require("../../models").Student;
const Teacher = require("../../models").Teacher;

const encodeField = [
    "en_name",
    "en_gender",
    "en_birthday",
    "en_age",
    "en_address",
    "en_phone",
    "en_email",
]

const convertAll = async () => {
    let parents = await Parent.findAll();
    let students = await Student.findAll();
    let teachers = await Teacher.findAll();
    let users = await User.findAll();

    for(let item of parents) {
        let build = await new parentUpdateService().enbuild({...item.dataValues});
        await item.update(build);
    }
    for(let item of students) {
        let build = await new parentUpdateService().enbuild({...item.dataValues});
        console.log("build", {...item.dataValues});
        await item.update(build);
    }
    for(let item of teachers) {
        let build = await new parentUpdateService().enbuild({...item.dataValues});
        await item.update(build);
    }
    for(let item of users) {
        let build = ({
            en_email: await new AesService().getStoreEncryptData(JSON.stringify(item.email || "")),
            en_userName: await new AesService().getStoreEncryptData(JSON.stringify(item.userName || "")),
            
        });
        await item.update(build);
    }
    console.log("DONE convert all")
}

module.exports = {convertAll}