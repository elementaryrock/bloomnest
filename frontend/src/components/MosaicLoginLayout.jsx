import React from 'react';

/**
 * Shared split-screen login layout with blue mosaic tiles.
 * Left panel: mosaic tiles + branding text
 * Right panel: children (the form)
 */
const MosaicLoginLayout = ({ children, tagline, taglineHighlight, taglineDescription }) => {
    // Generate 64 tiles for the 8x8 grid
    const tiles = Array.from({ length: 64 }, (_, i) => i);

    return (
        <div className="login-page-wrapper">
            <div className="login-container animate-fadeIn">
                {/* Left Panel — Blue Mosaic Tiles */}
                <div className="login-left-panel">
                    {/* Logo */}
                    <div className="login-left-logo">MEC</div>

                    {/* Mosaic Grid */}
                    <div className="mosaic-grid">
                        {tiles.map((i) => (
                            <div key={i} className="mosaic-tile" />
                        ))}
                    </div>

                    {/* Bottom text */}
                    <div className="login-left-text">
                        <h2>
                            {tagline || 'Therapy Unit'} <span>{taglineHighlight || 'Booking System'}</span>
                        </h2>
                        <p>
                            {taglineDescription || 'Marian Engineering College — streamlined therapy session management for parents, therapists, and staff.'}
                        </p>
                    </div>
                </div>

                {/* Right Panel — Form Content */}
                <div className="login-right-panel">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MosaicLoginLayout;
