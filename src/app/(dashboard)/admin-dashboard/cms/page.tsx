/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCmsMutation, useGetCmsQuery, useUpdateCmsMutation } from '@/redux/api/cmsApi';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';
import Image from 'next/image';
import { useUploadFileMutation } from '@/redux/api/uploaderApi';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa6';

const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

const CMSPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');

  type CmsFormData = any;

  const [formData, setFormData] = useState<CmsFormData>([]);
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
  const { data, isLoading, error, refetch } = useGetCmsQuery(activeTab);
  const [updateCms, { isLoading: isUpdating }] = useUpdateCmsMutation();
  const [createCms, { isLoading: isCreating }] = useCreateCmsMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalForm, setModalForm] = useState({
    tag: '',
    title: '',
    description: '',
    listDescription: [] as string[],
    button: { text: '', link: '' },
    image: '',
  });
  const [modalImagePreview, setModalImagePreview] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);

  const pages = [
    { id: 'home', label: 'Home' },
    { id: 'aboutUs', label: 'About Us' },
    { id: 'faq', label: 'FAQ' },
    { id: 'termsAndConditions', label: 'Terms & Conditions' },
    { id: 'contactUs', label: 'Contact Us' },
    { id: 'privacyPolicy', label: 'Privacy Policy' },
    { id: 'pricing', label: 'Pricing' },
  ];

  const pageData = useMemo(() => data?.data || {}, [data]);

  const isCreated = useMemo(() => !!pageData?.content, [pageData]);

  const defaultFormData = (tab: string) => {
    switch (tab) {
      case 'home':
      case 'aboutUs':
      case 'pricing':
        return [];
      case 'faq':
        return { faqs: [] };
      case 'termsAndConditions':
      case 'privacyPolicy':
        return { title: '', content: '' };
      case 'contactUs':
        return {
          email: '',
          phone: '',
          address: '',
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
          youtube: '',
          tiktok: '',
        };
      default:
        return {};
    }
  };

  useEffect(() => {
    setFormData(defaultFormData(activeTab));
    setImagePreviews({});
    setShowCreateForm(false);

    if (pageData?.content) {
      switch (activeTab) {
        case 'home':
        case 'aboutUs':
        case 'pricing':
          let contentArray = Array.isArray(pageData.content) ? pageData.content : [];
          if (!Array.isArray(pageData.content)) {
            const sections = activeTab === 'home' ? ['forLandlords', 'forTenants', 'testimonials'] : activeTab === 'aboutUs' ? ['whoWeAre', 'ourMission', 'ourVision'] : [];
            contentArray = sections
              .filter(tag => pageData.content?.[tag])
              .map(tag => ({
                tag,
                title: pageData.content[tag]?.title || '',
                description: pageData.content[tag]?.description || '',
                listDescription: pageData.content[tag]?.listDescription || [],
                button: pageData.content[tag]?.button || { text: '', link: '' },
                image: pageData.content[tag]?.image || '',
              }));
          }
          setFormData(contentArray);
          const previews = contentArray.reduce((acc: any, item: any) => {
            acc[item.tag] = item.image || '';
            return acc;
          }, {});
          setImagePreviews(previews);
          break;
        case 'faq':
          setFormData({
            faqs: pageData.content?.faqs || [{ question: '', answer: '' }],
          });
          break;
        case 'termsAndConditions':
        case 'privacyPolicy':
          setFormData({
            title: pageData.content?.title || '',
            content: pageData.content?.contentHtml || pageData.content?.content || '',
          });
          break;
        case 'contactUs':
          setFormData({
            email: pageData.content?.email || '',
            phone: pageData.content?.phone || '',
            address: pageData.content?.address || '',
            facebook: pageData.content?.facebook || '',
            instagram: pageData.content?.instagram || '',
            twitter: pageData.content?.twitter || '',
            linkedin: pageData.content?.linkedin || '',
            youtube: pageData.content?.youtube || '',
            tiktok: pageData.content?.tiktok || '',
          });
          break;
        default:
          setFormData([]);
      }
    }
  }, [pageData, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field, index] = name.split('.');
    if (activeTab === 'faq' && index !== undefined) {
      setFormData((prev: any) => ({
        ...prev,
        faqs: (prev.faqs ?? []).map((faq: any, n: number) =>
          n === parseInt(index) ? { ...faq, [field]: value } : faq
        ),
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSunEditorChange = (content: string) => {
    setFormData((prev: any) => ({ ...prev, content: content }));
  };

  const addFaq = () => {
    setFormData((prev: any) => ({
      ...prev,
      faqs: [...(prev.faqs ?? []), { question: '', answer: '' }],
    }));
  };

  const removeFaq = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      faqs: (prev.faqs ?? []).filter((_: any, n: number) => n !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payloadData;
      if (['home', 'aboutUs', 'pricing'].includes(activeTab)) {
        payloadData = formData; // array
      } else if (activeTab === 'faq') {
        payloadData = { faqs: formData.faqs };
      } else if (['termsAndConditions', 'privacyPolicy'].includes(activeTab)) {
        payloadData = { title: formData.title, contentHtml: formData.content };
      } else if (activeTab === 'contactUs') {
        payloadData = formData;
      }
      if (isCreated) {
        await updateCms({ pageName: activeTab, data: payloadData }).unwrap();
        toast.success('Page updated successfully');
      } else {
        await createCms({ pageName: activeTab, data: payloadData }).unwrap();
        toast.success('Page created successfully');
        setShowCreateForm(false);
        refetch();
      }
    } catch (err) {
      toast.error(isCreated ? 'Failed to update page' : 'Failed to create page');
    }
  };

  const handleDeletePage = async () => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        // await deleteCms(activeTab).unwrap();
        toast.success('Page deleted successfully');
        setFormData([]);
        setActiveTab('home');
        router.push('/cms/home');
      } catch (err) {
        toast.error('Failed to delete page');
      }
    }
  };

  // Array page functions (home, aboutUs, pricing)
  const openAddModal = () => {
    setSelectedItem(null);
    setModalForm({
      tag: '',
      title: '',
      description: '',
      listDescription: [],
      button: { text: '', link: '' },
      image: '',
    });
    setModalImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setModalForm({ ...item });
    setModalImagePreview(item.image || '');
    setIsModalOpen(true);
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('button.')) {
      const buttonField = name.split('.')[1];
      setModalForm((prev) => ({
        ...prev,
        button: { ...prev.button, [buttonField]: value },
      }));
    } else {
      setModalForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleModalListChange = (index: number, value: string) => {
    setModalForm((prev) => ({
      ...prev,
      listDescription: prev.listDescription.map((item: string, n: number) =>
        n === index ? value : item
      ),
    }));
  };

  const addModalListItem = () => {
    setModalForm((prev) => ({
      ...prev,
      listDescription: [...prev.listDescription, ''],
    }));
  };

  const removeModalListItem = (index: number) => {
    setModalForm((prev) => ({
      ...prev,
      listDescription: prev.listDescription.filter((_: string, n: number) => n !== index),
    }));
  };

  const handleModalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setModalImagePreview(previewUrl);

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('images', file);
        const uploadResponse = await uploadFile(uploadFormData).unwrap();
        const uploadedImageUrl = uploadResponse.data[0];
        setModalForm((prev) => ({ ...prev, image: uploadedImageUrl }));
        toast.success('Image uploaded successfully');
      } catch (err) {
        toast.error('Failed to upload image');
        setModalImagePreview('');
      }
    }
  };

  const saveModal = () => {
    if (!modalForm.tag || !modalForm.title || !modalForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    const newFormData = [...(Array.isArray(formData) ? formData : [])];
    if (selectedItem) {
      const index = newFormData.findIndex((item: any) => item.tag === selectedItem.tag);
      if (index !== -1) {
        newFormData[index] = modalForm;
      }
    } else {
      newFormData.push(modalForm);
    }
    setFormData(newFormData);
    setImagePreviews((prev) => ({ ...prev, [modalForm.tag]: modalForm.image }));
    setIsModalOpen(false);
  };

  const deleteItem = (tag: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const newFormData = (Array.isArray(formData) ? formData : []).filter((item: any) => item.tag !== tag);
      setFormData(newFormData);
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[tag];
        return newPreviews;
      });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) {
    let errorMsg = 'An error occurred';
    if ('message' in error && typeof error.message === 'string') {
      errorMsg = error.message;
    } else if ('status' in error && 'data' in error) {
      errorMsg = `Status: ${error.status}`;
    }
    return <div className="text-red-500 text-center">Error: {errorMsg}</div>;
  }

  const isArrayPage = ['home', 'aboutUs', 'pricing'].includes(activeTab);

  return (
    <div className="p-4 sm:p-6 !pb-20">
      <h1 className="text-3xl font-bold mb-6">CMS Management</h1>

      {/* Tabs */}
      <div className="flex flex-wrap overflow-x-auto border-b border-gray-200 mb-6">
        {pages.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        {isCreated || showCreateForm ? (
          <form onSubmit={handleSubmit}>
            {isArrayPage ? (
              <>
                {Array.isArray(formData) && formData.length === 0 ? (
                  <div className="text-center mb-4">
                    <p>No content available.</p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md mt-2"
                    >
                      Add New Item
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md mb-4"
                    >
                      Add New Item
                    </button>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-300 mb-4">
                        <thead>
                          <tr>
                            <th className="border p-2 text-left">Tag</th>
                            <th className="border p-2 text-left">Title</th>
                            <th className="border p-2 text-left">Description</th>
                            <th className="border p-2 text-left">List Items</th>
                            <th className="border p-2 text-left">Button Text</th>
                            <th className="border p-2 text-left">Button Link</th>
                            <th className="border p-2 text-left">Image</th>
                            <th className="border p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(formData) && formData.map((item: any) => (
                            <tr key={item.tag}>
                              <td className="border p-2">{item.tag}</td>
                              <td className="border p-2">{item.title}</td>
                              <td className="border p-2 truncate max-w-xs">{item.description}</td>
                              <td className="border p-2 truncate max-w-xs">{item.listDescription.join(', ')}</td>
                              <td className="border p-2">{item.button.text}</td>
                              <td className="border p-2 truncate max-w-xs">{item.button.link}</td>
                              <td className="border p-2">
                                {item.image && (
                                  <Image
                                    src={item.image}
                                    alt="preview"
                                    width={50}
                                    height={50}
                                    className="object-cover"
                                  />
                                )}
                              </td>
                              <td className="border p-2 flex items-center justify-center gap-2">
                                <button
                                  title="Edit"
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="text-primary px-2 py-1 rounded-md"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  title="Delete"
                                  type="button"
                                  onClick={() => deleteItem(item.tag)}
                                  className="text-red-400 px-2 py-1 rounded-md"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            ) : null}

            {activeTab === 'faq' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">FAQs</h2>
                {formData.faqs?.map((faq: any, index: number) => (
                  <div key={index} className="mb-4 p-4 border rounded-md">
                    <div className="mb-2">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor={`faqs.question.${index}`}>
                        Question
                      </label>
                      <input
                        type="text"
                        id={`faqs.question.${index}`}
                        name={`faqs.question.${index}`}
                        value={faq.question}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor={`faqs.answer.${index}`}>
                        Answer
                      </label>
                      <textarea
                        id={`faqs.answer.${index}`}
                        name={`faqs.answer.${index}`}
                        value={faq.answer}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md"
                    >
                      Remove FAQ
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFaq}
                  className="bg-yellow-500 text-white px-2 py-1 rounded-md"
                >
                  Add FAQ
                </button>
              </div>
            )}

            {(activeTab === 'termsAndConditions' || activeTab === 'privacyPolicy') && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Content</label>
                  <SunEditor
                    setContents={formData.content || ''}
                    onChange={handleSunEditorChange}
                    setOptions={{
                      height: '300px',
                      buttonList: [
                        ['undo', 'redo'],
                        ['font', 'fontSize', 'formatBlock'],
                        ['bold', 'underline', 'italic', 'strike'],
                        ['align', 'list', 'link'],
                        ['fullScreen', 'preview'],
                      ],
                    }}
                  />
                </div>
              </>
            )}

            {activeTab === 'contactUs' && (
              <>
                {['email', 'phone', 'address', 'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'].map((field) => (
                  <div key={field} className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2 capitalize" htmlFor={field}>
                      {field}
                    </label>
                    <input
                      type="text"
                      id={field}
                      name={field}
                      value={formData[field] || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={['email', 'phone', 'address'].includes(field)}
                    />
                  </div>
                ))}
              </>
            )}

            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                disabled={isUpdating || isCreating || isUploading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-yellow-800 disabled:bg-blue-300"
              >
                {isCreated
                  ? isUpdating
                    ? 'Updating...'
                    : 'Update Page'
                  : isCreating
                  ? 'Creating...'
                  : 'Create Page'}
              </button>
              {/* <button
                type="button"
                onClick={handleDeletePage}
                disabled={isDeleting}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300"
              >
                {isDeleting ? 'Deleting...' : 'Delete Page'}
              </button> */}
            </div>
          </form>
        ) : (
          <div className="text-center mb-4">
            <p>No content available for this page.</p>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(true);
                setFormData(defaultFormData(activeTab));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
              Add Page
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">{selectedItem ? 'Edit Item' : 'Add New Item'}</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tag</label>
              <input
                type="text"
                name="tag"
                value={modalForm.tag}
                onChange={handleModalInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={modalForm.title}
                onChange={handleModalInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={modalForm.description}
                onChange={handleModalInputChange}
                className="w-full p-2 border rounded-md"
                rows={4}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Button Text</label>
              <input
                type="text"
                name="button.text"
                value={modalForm.button.text}
                onChange={handleModalInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Button Link</label>
              <input
                type="text"
                name="button.link"
                value={modalForm.button.link}
                onChange={handleModalInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Image</label>
              {modalImagePreview && (
                <div className="mb-2">
                  <Image
                    src={modalImagePreview}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-md"
                    width={128}
                    height={128}
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleModalImageChange}
                className="w-full p-2 border rounded-md"
                disabled={isUploading}
              />
              {isUploading && <p className="text-gray-500 mt-1">Uploading...</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">List Items</label>
              {modalForm.listDescription.map((item: string, index: number) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleModalListChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeModalListItem(index)}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addModalListItem}
                className="bg-yellow-500 text-white px-2 py-1 rounded-md"
              >
                Add Item
              </button>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveModal}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSPage;