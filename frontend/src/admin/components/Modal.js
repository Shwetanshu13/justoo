"use client";

import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "sm:max-w-lg",
    footer,
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-900/50 transition-opacity"
                    onClick={onClose}
                ></div>
                <span
                    className="hidden sm:inline-block sm:align-middle sm:h-screen"
                    aria-hidden="true"
                >
                    &#8203;
                </span>

                {/* Modal panel */}
                <div
                    className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${maxWidth} sm:w-full`}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        {title && (
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5">{children}</div>

                    {/* Footer */}
                    {footer !== null && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            {footer ? (
                                footer
                            ) : (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn-secondary"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
