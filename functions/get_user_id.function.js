module.exports = {
    getUserID: async (username, baseUrl, headers) => {
        let userID = await axios({method: 'get', url: `${baseUrl}/users?login=${username}`, headers});
        return userID.data.data[0].id;
    }
}