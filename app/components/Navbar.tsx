import { Link, NavLink } from "@remix-run/react";

export default function Navbar() {

    const linkStyle = {
        color: "black",
        textDecoration: "none",
        display: "block",
        padding: "0.5rem 4rem",
        border: "1px solid gray",
        fontWeight: "bold",
    };

    return (
        <nav style={{ color: 'white', padding: '2rem 4rem' }}>
            <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
                 <li>
                    <NavLink to="/app" end style={({ isActive }) => ({
                        ...linkStyle,
                        backgroundColor: isActive ? "lightgray" : "transparent",
                        borderBottom: isActive ? "1px solid gray" : "1px solid gray",
                    })}>
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/app/analytics" end style={({ isActive }) => ({
                        ...linkStyle,
                        backgroundColor: isActive ? "lightgray" : "transparent",
                        borderBottom: isActive ? "1px solid gray" : "1px solid gray",
                    })}>
                        Analytics
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/app/membership/data"  style={({ isActive }) => ({
                        ...linkStyle,
                        backgroundColor: isActive ? "lightgray" : "transparent",
                        borderBottom: isActive ? "1px solid gray" : "1px solid gray",
                    })}>
                        Memberships
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/app/membership/perks"  end style={({ isActive }) => ({
                        ...linkStyle,
                        backgroundColor: isActive ? "lightgray" : "transparent",
                        borderBottom: isActive ? "1px solid gray" : "1px solid gray",
                    })}>
                        Perks
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/app/billing/plans"  end style={({ isActive }) => ({
                        ...linkStyle,
                        backgroundColor: isActive ? "lightgray" : "transparent",
                        borderBottom: isActive ? "3px solid gray" : "1px solid gray",
                    })}>
                        Billing
                    </NavLink></li>
            </ul>
        </nav>
    );
}