export interface DotNetVersionControlProps {
    baseVersion: string;
    sdkVersionsInstalled: string[];
    runtimeVersionsInstalled: string[];
    isEndOfSupport: boolean;
    endOfSupportDate: string;
}

export function DotNetVersionControl({ baseVersion, sdkVersionsInstalled, runtimeVersionsInstalled, isEndOfSupport, endOfSupportDate: endOfSupportDate }: DotNetVersionControlProps) {
    return (
        <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">.NET {baseVersion}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{sdkVersionsInstalled.length} SDK{sdkVersionsInstalled.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{runtimeVersionsInstalled.length} Runtime{runtimeVersionsInstalled.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {isEndOfSupport && (
                <>
                    <p className="text-sm text-gray-600 mb-2">End of Support - Legacy projects only</p>
                    <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                        ⚠️ Support ended {endOfSupportDate}
                    </div>
                </>
            )}

            {/* SDKs and Runtimes Section - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SDKs Section - Left */}
                {sdkVersionsInstalled.length > 0 && (
                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">SDKs:</h5>
                        <div className="space-y-1">
                            {sdkVersionsInstalled.map((sdk, index) => (
                                <div key={index} className="text-sm text-gray-600 bg-orange-50 px-2 py-1 rounded">
                                    {sdk}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Runtimes Section - Right */}
                {runtimeVersionsInstalled.length > 0 && (
                    <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Runtimes:</h5>
                        <div className="space-y-1">
                            {runtimeVersionsInstalled.map((runtime, index) => (
                                <div key={index} className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded">
                                    {runtime}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}