/*#region -- requires*/
/*
- You should provide your own project, not the example URL.
- You can submit a form that includes a file upload.
- The form file input field has the name attribute set to upfile.
- When you submit a file, you receive the file name, type, 
and size in bytes within the JSON response.
*/
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
/*#endregion*/

/*#region -- middleware*/
const upload = require('multer')({ dest: process.env.FILE_DEST })
app.use(cors());
/*#endregion*/

/*#region -- routes*/
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});
/*#endregion*/

/*#region -- api*/
app.post('/api/fileanalyse', upload.single('upfile'), function(req, res){
	try {
		const { file } = req;
		res.json({
			name: file.originalname,
			type: file.mimetype,
			size: file.size
		})
	} catch (err) {
		console.log(err)
		res.sendStatus(422)
	}
	return
})
/*#endregion*/

/*#region -- instance*/
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
/*#endregion*/
