
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cors = require("cors");

const app = express();

app.use(cors({
	origin: "http://localhost:4200",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

const JWT_SECRET = crypto.randomBytes(32).toString("hex");

const rolePermissions = {
	admin: [
		"merchant.read",
		"merchant.create",
		"merchant.update",
		"merchant.delete",
	],
	reviewer: [
		"merchant.read",
		"merchant.update",
	],
};

// Two predefined users; no database or signup.
const users = [
	{
		id: 1,
		name: "admin 1",
		email: "admin@test.com",
		password: "admin1",
		role: "admin",
	},
	{
		id: 2,
		name: "reviewer 1",
		email: "reviewer@test.com",
		password: "reviewer1",
		role: "reviewer",
	},
];

// Login
app.post("/api/auth/login", (req, res) => {
	const { email, password } = req.body || {};

	const user = users.find(
		(u) => u.email === email && u.password === password
	);

	if (!user) {
		return res.status(401).json({
			message: "Invalid email or password",
		});
	}

	const token = jwt.sign(
		{
			sub: String(user.id),
			role: user.role,
		},
		JWT_SECRET,
		{
			algorithm: "HS256",
			expiresIn: "15m",
			issuer: "mock-jwt-api",
			audience: "mock-jwt-client",
		}
	);

	res.json({
		message: "Login successful",
		token,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		},
	});
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({
			message: "Access token required",
		});
	}

	try {
		const payload = jwt.verify(
			authHeader.slice(7),
			JWT_SECRET,
			{
				algorithms: ["HS256"],
				issuer: "mock-jwt-api",
				audience: "mock-jwt-client",
			}
		);

		const user = users.find(
			(u) => String(u.id) === payload.sub &&
				u.role === payload.role
		);

		if (!user) {
			return res.status(401).json({
				message: "Invalid token user",
			});
		}

		req.user = {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		};

		next();
	} catch {
		return res.status(401).json({
			message: "Invalid or expired token",
		});
	}
}

app.get("/api/auth/permissions", authenticateToken, (req, res) => {
	res.json({
		role: req.user.role,
		permissions: rolePermissions[req.user.role] || [],
	});
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
	res.json({ user: req.user });
});


app.listen(5000, () => {
	console.log("Server running at http://localhost:5000");
});
