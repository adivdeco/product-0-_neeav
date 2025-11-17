const combinedAuthMiddleware = async (req, res, next) => {
    try {
        // First, execute adminMiddleware logic
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Not logged in" });

        const payload = jwt.verify(token, "secretkey");
        const { userId, role } = payload;

        if (!userId || (role !== 'co-admin' && role !== "admin")) {
            return res.status(403).send("Forbidden: You do not have admin access");
        }

        const finduser = await User.findById(payload.userId).select('-password');
        req.finduser = finduser;

        // Then, execute requireEmployee logic
        if (!finduser.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await User.findById(finduser.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'co-admin')) {
            return res.status(403).json({ message: 'Access denied. Employee/admin access required.' });
        }

        // Check if employee record exists, create if not
        let employee = await Employee.findOne({ user: finduser.userId });
        if (!employee) {
            employee = await Employee.create({
                user: finduser.userId,
                employeeId: `EMP${Date.now()}`,
                department: user.role === 'admin' ? 'admin' : 'customer_service',
                name: user.name,
                email: user.email,
                phone: user.phone
            });
        }

        req.employee = employee;
        next();
    } catch (error) {
        console.error('Combined auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};