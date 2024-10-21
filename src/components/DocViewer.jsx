import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthProvider";
import remarkGfm from "remark-gfm"; // GitHub-flavored markdown plugin

const DocViewer = () => {
    const { projectId } = useParams(); // Get projectId from the URL
    const { currentUser } = useAuth(); // Access the current authenticated user
    const [markdownContent, setMarkdownContent] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMarkdown = async () => {
            if (!projectId) {
                setError("Invalid project ID.");
                return;
            }

            if (!currentUser) {
                setError("User not authenticated.");
                return;
            }

            try {
                console.log(`Fetching document with projectId: ${projectId}`);
                console.log(`Using userId: ${currentUser.uid}`);

                const docRef = doc(db, "contributors", currentUser.uid, "projects", projectId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log("Document fetched successfully:", docSnap.data());
                    setMarkdownContent(docSnap.data().markdownContent);
                } else {
                    console.warn("Document not found.");
                    setError("Document not found.");
                }
            } catch (err) {
                console.error("Error fetching document:", err);
                setError("Failed to load document.");
            }
        };

        fetchMarkdown();
    }, [projectId, currentUser]);

    if (error) {
        return (
            <div className="p-8 bg-red-200 text-red-800 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-900 text-white min-h-screen">
            <h1 className="text-4xl font-extrabold mb-6 text-center text-primary">
                Project Documentation
            </h1>
            <div className="prose prose-invert lg:prose-xl mx-auto">
                <ReactMarkdown
                    children={markdownContent}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({ node, ...props }) => (
                            <h1 className="text-4xl font-bold text-secondary" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                            <h2 className="text-3xl font-semibold mt-4 text-primary" {...props} />
                        ),
                        code: ({ node, inline, className, children, ...props }) => (
                            <code
                                className={`bg-gray-800 text-green-400 rounded p-1 ${inline ? "inline" : "block p-4"
                                    }`}
                                {...props}
                            >
                                {children}
                            </code>
                        ),
                        blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-secondary pl-4 italic" {...props} />
                        ),
                        table: ({ node, ...props }) => (
                            <table className="table-auto border-collapse border border-gray-600" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                            <th className="border border-gray-500 bg-gray-800 px-4 py-2" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                            <td className="border border-gray-500 px-4 py-2" {...props} />
                        ),
                    }}
                />
            </div>
        </div>
    );
};

export default DocViewer;
