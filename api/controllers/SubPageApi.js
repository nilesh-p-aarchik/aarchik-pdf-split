
const pdfsplitMaster = require("../models/Master/PfdSplit");
const crudService = require('../services/crud.service');
const fireBase = require('../helper/firebaseHelper');

const SubPageApi = () => {

    const Add = async (req, res) => {
        try{
            let sub_array = [];
            let file_array = [];

            let getData = await crudService.get(pdfsplitMaster, {
                where : {DocNo : req.body.DocNo, DocType: req.body.DocType},
                attributes: ['id', 'DocNo', 'DocType','main_page','sub_page','file_name'],
                distinct: true,
            });
            
            if(getData.length == 0 ){
                return res.status(200).json({
                    code: 204,
                    success: false,
                    message: `DocType and DocNo is not valid`,
                });
            }
        
            let page = getData[0].main_page;
            page = page.split("/")
            
            let folderName = page[4];
            let fileName = (`${folderName}/${req.files.image.name}`);
            
            var url = await fireBase.uploadImageToStorage(req.files.image,folderName);

            if(getData[0].sub_page != null){
                sub_array.push(...getData[0].sub_page);
            }
            if(getData[0].file_name != null){
                file_array.push(...getData[0].file_name);
            }
        
            sub_array.push(url);
            file_array.push(fileName);
            req.body.sub_page = sub_array;
            req.body.file_name = file_array;
            
            await crudService.update(pdfsplitMaster, { id: getData[0].id }, req.body);

            return res.status(200).json({
                code: 200,
                success: true,
                message: `successfull.`,
            });

        }catch (error) {
                return res.status(error.status).json(error.error);
        }
    }
    return {
        Add,
    };
};



module.exports = SubPageApi;