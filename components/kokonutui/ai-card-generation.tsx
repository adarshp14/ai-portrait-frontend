import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Loader2, 
  Paintbrush,
  Box,
  Sun,
  User,
  Monitor,
  AlertCircle,
  Type
} from "lucide-react";

interface CardSettings {
  style: string;
  backgroundColor: string;
  lighting: string;
  pose: string;
  quality: string;
}

interface APIError {
  message: string;
  code?: string;
}

export default function AICardGeneration() {
  const [showForm, setShowForm] = useState(true);
  const [error, setError] = useState<APIError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>("");

  const [settings, setSettings] = useState<CardSettings>({
    style: "artistic",
    backgroundColor: "studio",
    lighting: "studio",
    pose: "profile",
    quality: "720p",
  });

  const settingsIcons = {
    style: <Paintbrush className="w-4 h-4" />,
    backgroundColor: <Box className="w-4 h-4" />,
    lighting: <Sun className="w-4 h-4" />,
    pose: <User className="w-4 h-4" />,
    quality: <Monitor className="w-4 h-4" />
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    setIsLoading(true);
    setError(null);

    const fullPrompt = `${userPrompt} in ${settings.style} style, with a ${settings.backgroundColor} background, ${settings.lighting} lighting, ${settings.pose} pose, and ${settings.quality} quality.`;

    try {
      // Input validation
      if (!userPrompt.trim()) {
        throw { message: "Please provide a description for your portrait", code: "EMPTY_PROMPT" };
      }

      if (userPrompt.length > 500) {
        throw { message: "Portrait description is too long. Please keep it under 500 characters", code: "PROMPT_TOO_LONG" };
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw {
          message: errorData?.message || "Failed to generate image",
          code: errorData?.code || response.status.toString()
        };
      }

      const blob = await response.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        typeof err === 'object' && err && 'message' in err ? String(err.message) : 
        'An unexpected error occurred';
      
      setError({ 
        message: errorMessage,
        code: (err as APIError)?.code || 'UNKNOWN_ERROR'
      });
      setShowForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSettings = () => {
    setShowForm(true);
    setError(null);
    setImageUrl(null);
  };

  const getErrorDisplay = (error: APIError) => {
    const errorMessages: Record<string, string> = {
      'EMPTY_PROMPT': 'Please provide a description for your portrait',
      'PROMPT_TOO_LONG': 'Portrait description is too long. Please keep it under 500 characters',
      'RATE_LIMIT': 'You\'ve reached the maximum number of generations. Please try again later',
      'INAPPROPRIATE_CONTENT': 'Your prompt contains inappropriate content',
      'SERVER_ERROR': 'Our servers are experiencing issues. Please try again later',
      'NETWORK_ERROR': 'Please check your internet connection and try again',
    };

    return errorMessages[error.code || ''] || error.message;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-indigo-600" />
            <div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                AI Portrait Studio
              </CardTitle>
              <CardDescription className="text-gray-500">
                Create stunning AI-generated portraits with precise controls
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorDisplay(error)}</AlertDescription>
            </Alert>
          )}

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt" className="text-sm font-semibold flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Describe your portrait
                  </Label>
                  <Input
                    id="prompt"
                    placeholder="E.g., A woman with flowing hair in a garden..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="mt-2 h-12"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {userPrompt.length}/500 characters
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-sm font-semibold capitalize flex items-center gap-2">
                        {settingsIcons[key as keyof typeof settingsIcons]}
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <select
                        value={value}
                        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                        className="mt-2 w-full p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        {key === 'style' && (
                          <>
                            <option value="artistic">Artistic</option>
                            <option value="realistic">Realistic</option>
                            <option value="cartoon">Cartoon</option>
                          </>
                        )}
                        {key === 'backgroundColor' && (
                          <>
                            <option value="studio">Studio</option>
                            <option value="outdoor">Outdoor</option>
                            <option value="abstract">Abstract</option>
                          </>
                        )}
                        {key === 'lighting' && (
                          <>
                            <option value="studio">Studio</option>
                            <option value="soft">Soft</option>
                            <option value="dramatic">Dramatic</option>
                          </>
                        )}
                        {key === 'pose' && (
                          <>
                            <option value="profile">Profile</option>
                            <option value="full-body">Full Body</option>
                            <option value="close-up">Close-up</option>
                          </>
                        )}
                        {key === 'quality' && (
                          <>
                            <option value="720p">720p</option>
                            <option value="1080p">1080p</option>
                            <option value="4K">4K</option>
                          </>
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg font-semibold text-sm hover:opacity-90 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  'Generate Portrait'
                )}
              </button>
            </form>
          ) : (
          //   <div className="space-y-6">
          //   {isLoading ? (
          //     <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          //       <div className="flex flex-col items-center gap-4">
          //         <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          //         <p className="text-sm text-gray-500">Creating your masterpiece...</p>
          //       </div>
          //     </div>
          //   ) : imageUrl ? (
          //     <div className="relative">
          //       <img
          //         src={imageUrl}
          //         alt="Generated portrait"
          //         className="w-full h-auto rounded-lg shadow-lg"
          //       />
          //       <a
          //         href={imageUrl}
          //         download="portrait.png"
          //         className="absolute inset-x-0 bottom-4 mx-auto bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          //       >
          //         Download Image
          //       </a>
          //     </div>
          //   ) : null}
          
          //   <button
          //     onClick={handleBackToSettings}
          //     className="w-full bg-gray-100 text-gray-700 p-4 rounded-lg font-semibold text-sm hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all"
          //   >
          //     Back to Settings
          //   </button>
          // </div>
          <div className="space-y-6">
  {isLoading ? (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-gray-500">Creating your masterpiece...</p>
      </div>
    </div>
  ) : imageUrl ? (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Generated portrait"
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  ) : null}

  {/* Buttons Container */}
  <div className="flex items-center justify-between gap-4">
    <button
      onClick={handleBackToSettings}
      className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg font-medium text-sm hover:bg-gray-300 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all"
    >
      Back to Settings
    </button>
    {imageUrl && (
      <a
        href={imageUrl}
        download="portrait.png"
        className="flex-1 bg-indigo-600 text-white p-3 rounded-lg font-medium text-sm text-center hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
      >
        Download
      </a>
    )}
  </div>
</div>

          
          )}
        </CardContent>
      </Card>
    </div>
  );
}