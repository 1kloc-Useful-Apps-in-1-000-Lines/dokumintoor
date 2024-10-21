import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthProvider";

const DocumentationForm = ({ selectedDoc, setSelectedDoc, onGenerate }) => {
    const { currentUser } = useAuth(); // Use currentUser from AuthProvider
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        installation: "",
        usage: "",
        license: "MIT",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (selectedDoc) {
            setFormData({
                title: selectedDoc.title,
                description: selectedDoc.description,
                installation: selectedDoc.installation,
                usage: selectedDoc.usage,
                license: selectedDoc.license,
            });
        }
    }, [selectedDoc]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if the user is logged in
        if (!currentUser) {
            alert("You must be logged in to submit documentation.");
            return;
        }

        const markdownContent = generateMarkdownContent(formData);

        try {
            setSaving(true);

            // Generate a project ID or use existing one if editing
            const projectId = selectedDoc
                ? selectedDoc.id
                : formData.title.toLowerCase().replace(/\s+/g, "-");

            // Save the document to Firestore
            await setDoc(
                doc(db, "contributors", currentUser.uid, "projects", projectId),
                {
                    ...formData,
                    markdownContent,
                    timestamp: serverTimestamp(),
                }
            );

            // Notify and reset the form
            onGenerate(markdownContent);
            alert("Documentation saved successfully!");

            setFormData({
                title: "",
                description: "",
                installation: "",
                usage: "",
                license: "MIT",
            });
            setSelectedDoc(null);
        } catch (error) {
            console.error("Error saving doc:", error);
            alert("Failed to save documentation.");
        } finally {
            setSaving(false);
        }
    };

    const generateMarkdownContent = (data) => `
# ${data.title}

## Description
${data.description}

## Installation
\`\`\`bash
${data.installation}
\`\`\`

## Usage
\`\`\`javascript
${data.usage}
\`\`\`

## License
${data.license}
`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                name="title"
                placeholder="Project Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                required
            />
            <textarea
                name="description"
                placeholder="Project Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={4}
                required
            />
            <textarea
                name="installation"
                placeholder="Installation Instructions"
                value={formData.installation}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={4}
                required
            />
            <textarea
                name="usage"
                placeholder="Usage Example"
                value={formData.usage}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={4}
                required
            />
            <select
                name="license"
                value={formData.license}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            >
                <option value="MIT">MIT</option>
                <option value="GPL-3.0">GPL-3.0</option>
                <option value="Apache-2.0">Apache-2.0</option>
            </select>
            <button
                type="submit"
                className={`w-full p-3 text-white rounded ${saving ? "bg-gray-500" : "bg-primary"
                    }`}
                disabled={saving}
            >
                {saving ? "Saving..." : selectedDoc ? "Update Documentation" : "Save Documentation"}
            </button>
        </form>
    );
};

export default DocumentationForm;
