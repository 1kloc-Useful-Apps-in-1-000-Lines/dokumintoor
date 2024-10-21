import { nanoid } from 'nanoid';
import { useAuth } from '../context/AuthProvider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useState, useEffect } from 'react';

const DocumentationForm = ({ selectedDoc, setSelectedDoc, onGenerate }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        installation: '',
        usage: '',
        license: 'MIT',
    });
    const [saving, setSaving] = useState(false);

    // Load selected doc's data into the form when editing
    useEffect(() => {
        if (selectedDoc) {
            setFormData({
                title: selectedDoc.title || '',
                description: selectedDoc.description || '',
                installation: selectedDoc.installation || '',
                usage: selectedDoc.usage || '',
                license: selectedDoc.license || 'MIT',
            });
        }
    }, [selectedDoc]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('You must be logged in to submit documentation.');
            return;
        }

        const markdownContent = generateMarkdownContent(formData);

        try {
            setSaving(true);

            const projectId = selectedDoc ? selectedDoc.id : nanoid();

            // Save the document to Firestore
            await setDoc(
                doc(db, 'contributors', currentUser.uid, 'projects', projectId),
                { ...formData, markdownContent, timestamp: serverTimestamp() }
            );

            onGenerate(markdownContent, projectId); // Trigger callback with content and ID
            alert('Documentation saved successfully!');
            resetForm();
        } catch (error) {
            console.error('Error saving doc:', error);
            alert('Failed to save documentation.');
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

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            installation: '',
            usage: '',
            license: 'MIT',
        });
        setSelectedDoc(null); // Clear the selected document after submission
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                name="title"
                placeholder="Project Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded"
            />
            <textarea
                name="description"
                placeholder="Project Description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded"
            />
            <textarea
                name="installation"
                placeholder="Installation Instructions"
                value={formData.installation}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded"
            />
            <textarea
                name="usage"
                placeholder="Usage Example"
                value={formData.usage}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded"
            />
            <select
                name="license"
                value={formData.license}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded"
            >
                <option value="MIT">MIT</option>
                <option value="GPL-3.0">GPL-3.0</option>
                <option value="Apache-2.0">Apache-2.0</option>
            </select>
            <button
                type="submit"
                disabled={saving}
                className={`w-full p-3 text-white rounded ${saving ? 'bg-gray-500' : 'bg-primary'}`}
            >
                {saving ? 'Saving...' : selectedDoc ? 'Update Documentation' : 'Save Documentation'}
            </button>
        </form>
    );
};

export default DocumentationForm;
