const publicRoutes = {

    'POST /pdf': 'PdfApi.save',
    'POST /delete': 'PdfApi.destroy',
    'GET /get': 'PdfApi.get',

    'POST /subpage': 'SubPageApi.Add',

};
  
  module.exports = publicRoutes;
  