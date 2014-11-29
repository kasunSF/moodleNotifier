var DataAccess = {
    /*
     This function access to the local storage in user's computer and stores given data at given directory.

     directoryName: Name of the directory where data is stored.
     data: Data to be stored.
     */
    setData: function (directoryName, data) {
        localStorage[directoryName] = data;
    },

    /*
     This function access to the local storage in user's computer and retrives data at given directory.

     directoryName: Name of the directory where data is stored.
     returns data at given directory.
     */
    getData: function (directoryName) {
        return localStorage[directoryName];
    }
}