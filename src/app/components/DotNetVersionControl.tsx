interface SdkInfo {
    version: string;
    path: string;
}

interface RuntimeInfo {
    version: string;
    path: string;
    package: string;
}

export interface DotNetVersionControlProps {
    baseVersion: string;
    sdkVersionsInstalled: SdkInfo[];
    runtimeVersionsInstalled: RuntimeInfo[];
}

export function DotNetVersionControl({ baseVersion, sdkVersionsInstalled, runtimeVersionsInstalled, isEndOfSupport, endOfSupportDate: endOfSupportDate }: DotNetVersionControlProps) {
    return (
        <div className="bg-white p-4 rounded-lg border min-w-0 w-full">
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">.NET {baseVersion}</h4>
                {(sdkVersionsInstalled.length > 0 || runtimeVersionsInstalled.length > 0) ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        Installed
                    </span>
                ) : (
                    <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                        Not Installed
                    </span>
                )}
            </div>

            {/* SDKs and Runtimes Section - Stacked Vertically */}
            <div className="space-y-4">
                {/* SDKs Section - Top */}
                <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">SDKs:</h5>
                    {sdkVersionsInstalled.length > 0 ? (
                        <div className="space-y-1 mb-3">
                            {sdkVersionsInstalled.map((sdk, index) => (
                                <div key={index} className="text-sm text-gray-600 bg-orange-50 px-2 py-1 rounded break-words">
                                    <div className="font-medium">SDK</div>
                                    <div className="text-xs text-gray-500">{sdk.version}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-orange-600 italic mb-3">No SDKs installed</p>
                    )}
                    <button 
                        className="w-full px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 rounded-md transition-colors"
                        onClick={() => console.log(`Install SDK for .NET ${baseVersion}`)}
                    >
                        Install SDK
                    </button>
                </div>

                {/* Runtimes Section - Bottom */}
                <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Runtimes:</h5>
                    {runtimeVersionsInstalled.length > 0 ? (
                        <div className="space-y-1 mb-3">
                            {runtimeVersionsInstalled.map((runtime, index) => (
                                <div key={index} className="text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded break-words">
                                    <div className="font-medium">{runtime.package}</div>
                                    <div className="text-xs text-gray-500">{runtime.version}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-orange-600 italic mb-3">No Runtimes installed</p>
                    )}
                    <button 
                        className="w-full px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 rounded-md transition-colors"
                        onClick={() => console.log(`Install Runtime for .NET ${baseVersion}`)}
                    >
                        Install Runtime
                    </button>
                </div>
            </div>
        </div>
    );
}