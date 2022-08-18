const PfdSplitModel = require('../models/Master/PfdSplit');
const crudService = require('../services/crud.service');
const ReadText = require('text-from-image');
const { Storage } = require('@google-cloud/storage');
const Tesseract  = require('tesseract.js');
const { Op } = require("sequelize");

const storage = new Storage({
  projectId: 'my-project-fcdab',
  credentials: require('../../satsang-book-management-firebase-adminsdk-ast1q-c2f99639c1.json'),
  predefinedAcl: 'publicRead',
  cacheControl: 'public, max-age=31536000'
});

const bucket = storage.bucket("gs://my-project-fcdab.appspot.com");

const PdfApi = () => {
    const save = async (req, res) => {
        try {   
            let DocNo;
            let DocType;
            let response;
            let sub_array = [];
            let file_array = [];
                
                const letters = new Set();
                const [files] = await bucket.getFiles();
                
                for (const file of files) {
                    const [metadata] = await file.getMetadata();
                    let folderName = metadata.name;
                    folderName = folderName.split("/")
                    letters.add(folderName[0]);
                };
                console.log('Files:',letters); 
                var IDs = [];
                var file_names = [];
                for(let name of letters){

                        const [files] = await bucket.getFiles({ prefix: `${name}/` });
                        
                        let getData = await crudService.get(PfdSplitModel, {
                            attributes: ['id','file_name'],
                            distinct: true,
                        });

                        files.forEach(async file => {  
                        let fileName = file.name;
                        console.log(fileName,"filename")
                        let urlExits = false;
                        
                        
                        if(getData.length > 0 ){
                            for(let checkdata of getData){
                                for (let checkfile of checkdata.file_name){
                                    console.log(checkfile,"checkfile")
                                    if(checkfile == fileName) {
                                        console.log("true")
                                        urlExits = true;
                                    }
                                }
                            }
                            if (urlExits == false){
                                if(fileName != `${name}/`){
                                    //fileName = fileName.split("/");
                                    let url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
                                    IDs.push(url);
                                    file_names.push(fileName);
        
                                } 
                            }
                        } 
                        else {
                            console.log("else part")
                            if(fileName != `${name}/`){
                                //fileName = fileName.split("/");      
                                let url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
                                console.log(url,"url")
                                IDs.push(url);
                                file_names.push(fileName);
    
                            }  
                        }
                    });
                }
                console.log(IDs,"ids")
                console.log(file_names,"file_names")
                if(IDs.length > 0 ) {
                    
                    for(let i = 0; i < IDs.length; i++){
                    for(let j = i; j < i+1; j++){
                    
                    console.log(IDs[i],"ids")
                    console.log(file_names[j],"file_names")
                    
                    await Tesseract.recognize(IDs[i], 'eng').then(async ({ data: { text } }) => {
                    
                    let arrayItem = text.split('\n');
                    
                    let findType = arrayItem.findIndex((item) => item.search('Doc. Type') !== -1);
                    
                    let findNo = arrayItem.findIndex((item) => item.search('Doc.No') !== -1);
                    
                    if(findType > -1 && findNo > -1){
                    
                        filterType = arrayItem.filter((items, key) => findType == key)[0];
                        filterNo = arrayItem.filter((items, key) => findNo == key)[0];
                        
                        let strArray = [];

                        strArray = filterNo.split(" "); 
                         
                        let findnoid = strArray.findIndex((item) => item.search('Doc.No') !== -1);
                        
                        if(strArray[findnoid + 1].length == "1"){

                            DocNo = strArray[findnoid + 2];
                        }
                        else{
                            DocNo = strArray[findnoid + 1];
                            DocNo = DocNo.slice(1);
                        }
                               
                        strArray = filterType.split(" "); 
                        
                        let findtypeid = strArray.findIndex((item) => item.search('Type') !== -1);
                        if(strArray[findtypeid + 1].length == "1"){
                            DocType = strArray[findtypeid + 2];
                        }
                        else{
                            DocType = strArray[findtypeid + 1];
                            DocType = DocType.slice(1);
                        }
                        file_array.push(file_names[j]);
                        req.body.DocNo = DocNo;
                        req.body.DocType = DocType;
                        req.body.main_page = IDs[i];
                        req.body.sub_page = null;
                        req.body.file_name = file_array;
                        let currDate = new Date();
                        currDate = formatDate(currDate);
                        req.body.date = currDate;
                        response = await crudService.insert(PfdSplitModel, req.body); 
                        file_array = [];
                    } 
                    else{
                        console.log("else condition")
                        let getData = await crudService.get(PfdSplitModel, {
                            where: {id: response.id},
                            attributes: ['id', 'DocNo', 'DocType','main_page','sub_page','file_name'],
                            distinct: true,
                        });
                    
                        if(getData[0].sub_page != null){
                            sub_array.push(...getData[0].sub_page);
                        }
                        if(getData[0].file_name != null){
                            file_array.push(...getData[0].file_name);
                        }
                    
                        sub_array.push(IDs[i]);
                        file_array.push(file_names[j]);
                        req.body.sub_page = sub_array;
                        req.body.file_name = file_array;
                        
                        await crudService.update(PfdSplitModel, { id: response.id }, req.body);

                        sub_array = [];
                        file_array = [];
                    }      
                })
                // .catch(err => {
                //         console.log(err);
                // })      
            }    
            }
        }
            console.log("Task Finish")
            return res.status(200).json({
                code: 200,
                success: true,
                message: `successfull.`,
            });
                
            
        } catch (error) {
            return res.status(error.status).json(error.error);
        }
    };
    const destroy = async (req, res) => {
        try {
            if (req.body.id) {
                for (let id of req.body.record_id) {
                    let response = await crudService.destroy(PfdSplitModel, { id: id });
                }
                return res.status(200).json({
                    code: 2000,
                    success: true,
                    message: `deleted successfully.`,
                    data: {}
                });
            } else {
                return res.status(200).json({
                    code: 4000,
                    success: false,
                    message: `Invalid Url Parameters`,
                    data: {}
                });
            }
        } catch (error) {
            return res.status(error.status).json(error.error);
        }
    };
    const get = async (req, res) => { 
        
        let setResponse = null;
        try { 
             
            let whereClause = {};
            whereClause.is_deleted = false;
           
            if(req.query.id) {
                whereClause.id = { [Op.eq]: req.query.id }            
            }
            if(req.query.DocNo) {
                whereClause.DocNo = { [Op.eq]: req.query.DocNo }            
            }
            if(req.query.DocType) {
                whereClause.DocType = { [Op.iLike]: req.query.DocType }            
            }
            if(req.query.date) {
                whereClause.date = { [Op.eq]: req.query.date }            
            }
            if(req.query.start_date && req.query.end_date) {
                whereClause.date = { [Op.between]: [req.query.start_date, req.query.end_date] }            
            }
            let conditions = {
                where: whereClause,
                attributes: ['id', 'DocNo', 'DocType','main_page','sub_page','file_name'],
                distinct: true,
            };
            
            if (req.query.pageSize) {
                const offset = (req.query.currentPage - 1) * req.query.pageSize;
                conditions.offset = offset;
                conditions.limit = req.query.pageSize;
            }   

            const getRefund = await crudService.get(PfdSplitModel, conditions);

            if(getRefund.length == 0){
                return res.status(200).json({
                   code: 203,
                   success: true,
                   message: `No Data Found`
                 });
            }

            setResponse = {
                code: 200,
                success: true,
                message:`Data get successfully`,
                data: getRefund,
            }

            if (req.query.pageSize) {
                setResponse.pageInfo = {
                    totalItems: await PfdSplitModel.count({ where: whereClause }),
                    currentPage: Number(req.query.currentPage),
                    pageSize: Number(req.query.pageSize)
                };
            }
            return res.status(201).json(setResponse);
        } catch (error) {
            return res.status(error.status).json(error.error);
        }
    }
    return {
        save,
        destroy,
        get
    };
};
module.exports = PdfApi;

function formatDate(date) {
    var d = new Date(date),

    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    
    if (month.length < 2)
      month = '0' + month;
    
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
    
}



