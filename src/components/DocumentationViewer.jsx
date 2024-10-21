import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

const DocumentationViewer = ({ contributorId, projectId }) => {
    const [docData, setDocData] = useState(null);

    useEffect(() => {
        const fetchDoc = async () => {
            const docRef = doc(db, "contributors", contributorId, "projects", projectId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setDocData(docSnap.data());
            } else {
                console.log("No such document!");
            }
        };

        fetchDoc();
    }, [contributorId, projectId]);

    return (
        <div className="p-4">
            {docData ? (
                <pre className="bg-gray-100 p-4 rounded">{docData.markdownContent}</pre>
            ) : (
                <p>No documentation found.</p>
            )}
        </div>
    );
};

export default DocumentationViewer;