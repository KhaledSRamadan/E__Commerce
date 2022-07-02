const jwt = require('jsonwebtoken');
const tokenSecret = "my-token-secret";

module.exports =function auth(req, res, next){
	const token = req.header('auth-token');
	if(!token) return res.status(401).send("Access Denied");

	try{
		const verified = jwt.verify(token,tokenSecret);
		req.user= verified;
		next();
	}catch(err){
		res.status(400).send('Invalid Token');
	}

}