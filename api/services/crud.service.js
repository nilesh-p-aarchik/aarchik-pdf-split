const { Validator } = require('node-input-validator');

const validate = (reqBody, schemas) => {
  return new Promise((resolve, reject) => {
    const niv = require('node-input-validator');
    console.log(schemas)
    const v = new Validator(reqBody, schemas.validator);
    niv.niceNames(schemas.niceNames || {});
    v.check().then((matched) => {
      if (!matched) {
        reject(v.errors);
      } else {
        resolve(reqBody)
      }
    });
  });
}

const insert = (model, dataToInsert) => {
  return new Promise((resolve, reject) => {
    dataToInsert.is_deleted = false;
    dataToInsert.deletedAt = null;
    model.create(dataToInsert).then((res) => {
      resolve(JSON.parse(JSON.stringify(res)));
    }).catch((err) => {
      reject(handleErrorResponse(err));
    });
  });
}

const update = async (model, objectToFind, attributesToUpdate, checkNonDeletedDataOnly = true) => {
  return new Promise((resolve, reject) => {
    if (checkNonDeletedDataOnly) {
      objectToFind.is_deleted = false;
    }
    attributesToUpdate.is_deleted = false;
    attributesToUpdate.deleted_at = null;
    model.update(attributesToUpdate, { where: objectToFind }).then((res) => {
      resolve(JSON.parse(JSON.stringify(res)));
    }).catch((err) => {
      reject(handleErrorResponse(err));
    });
  });
}

const destroy = async (model, objectToFind) => {
  return new Promise((resolve, reject) => {
    model.update({ is_deleted: true, deletedAt: new Date() }, { where: objectToFind }).then((res) => {
      resolve(JSON.parse(JSON.stringify(res)));
    }).catch((err) => {
      reject(handleErrorResponse(err));
    });
  });
}

const destroyHard = async (model, objectToFind) => {
  return new Promise((resolve, reject) => {
    model.destroy({ where: objectToFind }).then((res) => {
      resolve(JSON.parse(JSON.stringify(res)));
    }).catch((err) => {
      reject(handleErrorResponse(err));
    });
  });
}

const get = async (model, options) => {
  return new Promise((resolve, reject) => {
    model.findAll(options).then((res) => {
      resolve(JSON.parse(JSON.stringify(res)));
    }).catch((err) => {
      reject(handleErrorResponse(err));
    });
  });
}

const getOne = async (model, options) => {
  return new Promise((resolve, reject) => {
    model.findOne(options).then((res) => {
      resolve(JSON.parse(JSON.stringify(res)));
    }).catch((err) => {
      reject(handleErrorResponse(err));
    });
  });
}

const handleErrorResponse = (errObj) => {
  switch (errObj.name) {
    case 'SequelizeUniqueConstraintError':
      return {
        status: 200,
        error: {
          code: 4002, sucess: false, message: "Validation Failed", errors: errObj.errors.map(t => {
            return {
              message: t.message,
              type: t.type,
              path: t.path,
              value: t.value,
            }
          })
        }
      }
    case 'SequelizeValidationError':
      return {
        status: 200,
        error: {
          code: 4002, sucess: false, message: "Validation Failed", errors: errObj.errors.map(t => {
            return {
              message: t.message,
              type: t.type,
              path: t.path,
              value: t.value,
            }
          })
        }
      }
    default:
      return {
        status: 500,
        message: "Internal Server Error",
        error: errObj
      }
  }
}

module.exports = {
  validate,
  insert,
  update,
  destroy,
  destroyHard,
  get,
  getOne
};
