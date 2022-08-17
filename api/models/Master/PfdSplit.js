
const Sequelize = require('sequelize');

const sequelize = require('../../../config/database');
const { STRING } = require('sequelize');

const hooks = {};

const tableName = 'pdf_split';

const PfdSplit = sequelize.define('PfdSplit', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  DocNo: {
    type: Sequelize.STRING,
  },
  DocType: {
    type: Sequelize.STRING,
  },
  main_page: {
    type: Sequelize.STRING,
  },
  sub_page: {
    type: Sequelize.ARRAY(STRING),
  },
  file_name: {
    type: Sequelize.ARRAY(STRING),
  },
  date: {
    type: Sequelize.DATEONLY,
  },
  is_deleted: {
    type: Sequelize.BOOLEAN,
  },
  deleted_at: {
    type: Sequelize.DATE,
  }
},
  { hooks, tableName });

module.exports = PfdSplit;
