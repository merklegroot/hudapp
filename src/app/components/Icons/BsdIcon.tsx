export interface BsdIconProps {
    className?: string;
}

export function BsdIcon({ className = "w-5 h-5" }: BsdIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="12" cy="12" r="11" stroke="#000000" strokeWidth="1" fill="none" />
            <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="8"
                fontWeight="900"
                fill="#ef4444"
                fontFamily="Arial, sans-serif"
            >
                BSD
            </text>
        </svg>
    );
}
