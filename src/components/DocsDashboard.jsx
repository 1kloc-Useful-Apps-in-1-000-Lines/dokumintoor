import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import DocumentationForm from "./DocumentationForm";
import { collection, query, onSnapshot, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const DocsDashboard = () => {
    const { currentUser, logout } = useAuth();
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [markdownContent, setMarkdownContent] = useState("");
    const [isViewerOpen, setViewerOpen] = useState(false); // Control document view visibility
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        const q = query(collection(db, "contributors", currentUser.uid, "projects"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedDocs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDocs(fetchedDocs);
        });

        return () => unsubscribe();
    }, [currentUser, navigate]);

    const handleGenerate = useCallback((content) => {
        setMarkdownContent(content);
        setViewerOpen(true); // Open the viewer when markdown is generated
    }, []);

    const viewMarkdown = async (docId) => {
        const docRef = doc(db, "contributors", currentUser.uid, "projects", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const { markdownContent } = docSnap.data();
            setMarkdownContent(markdownContent);
            setViewerOpen(true); // Open the viewer
        } else {
            alert("No markdown found for this document.");
        }
    };

    const downloadMarkdown = () => {
        const blob = new Blob([markdownContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "documentation.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = async (docId) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                await deleteDoc(doc(db, "contributors", currentUser.uid, "projects", docId));
                alert("Document deleted successfully.");
            } catch (error) {
                console.error("Error deleting document:", error);
                alert("Failed to delete document.");
            }
        }
    };

    return (
        <div className="p-8 space-y-8 bg-background text-text min-h-screen">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">
                    Welcome, {currentUser?.moniker || "Contributor"}!
                </h2>
                <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                >
                    Logout
                </button>
            </div>

            <DocumentationForm
                selectedDoc={selectedDoc}
                setSelectedDoc={setSelectedDoc}
                onGenerate={handleGenerate}
            />

            {isViewerOpen && (
                <div className="mt-8 p-6 bg-primary rounded shadow-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Generated Documentation</h3>
                        <div className="space-x-2">
                            <button
                                onClick={downloadMarkdown}
                                className="px-4 py-2 bg-secondary text-black rounded"
                            >
                                Download Markdown
                            </button>
                            <button
                                onClick={() => setViewerOpen(false)}
                                className="px-2 py-1 bg-secondary text-black rounded"
                            >
                                Collapse
                            </button>
                        </div>
                    </div>
                    <pre className="mt-4 p-4 bg-gray-800 text-text rounded overflow-auto max-h-96">
                        {markdownContent}
                    </pre>
                </div>
            )}

            <div className="mt-8">
                <h3 className="text-xl font-semibold">Your Saved Documentation</h3>
                {docs.length === 0 ? (
                    <p>No documentation available.</p>
                ) : (
                    docs.map((doc) => (
                        <div
                            key={doc.id}
                            className="p-4 bg-cyan-400 text-black rounded mt-4 shadow"
                        >
                            <h4 className="text-lg font-semibold">{doc.title}</h4>
                            <p>{doc.description}</p>
                            <div className="space-x-2 mt-2">
                                <button
                                    onClick={() => setSelectedDoc(doc)}
                                    className="px-4 py-2 bg-primary text-white rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => viewMarkdown(doc.id)}
                                    className="px-4 py-2 bg-green-500 text-white rounded"
                                >
                                    View Markdown
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DocsDashboard;
