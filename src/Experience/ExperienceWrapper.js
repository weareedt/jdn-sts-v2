import React, { useEffect, useRef } from 'react';
import Experience from './Experience.js';

export default function ExperienceWrapper() {
    const containerRef = useRef(null);
    const experienceRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && !experienceRef.current) {
            experienceRef.current = new Experience({
                targetElement: containerRef.current
            });
        }

        return () => {
            if (experienceRef.current) {
                experienceRef.current.destroy();
                experienceRef.current = null;
            }
        };
    }, []);

    return <div ref={containerRef} className="experience"></div>;
}
