// app/(admin)/roadmaps/[id]/edit/page.jsx
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRoadmaps } from '../../../../../hooks/useRoadmaps';
import RoadmapForm from '../../../../../components/admin/dashboard/roadmap/RoadmapForm';
import Loader from '../../../../../components/ui/Loader';

export default function EditRoadmapPage() {
  const { roadmapId } = useParams();
  const { currentRoadmap, fetchRoadmapById, editRoadmap, loading } = useRoadmaps();
console.log(currentRoadmap,'current roadmap in edit page');

  useEffect(() => {
    if (roadmapId) fetchRoadmapById(roadmapId);
  }, [roadmapId, fetchRoadmapById]);

  const handleSubmit = async (data) => {
    await editRoadmap(roadmapId, data);
  };

  if (loading || !currentRoadmap) {
    return <Loader />;
  }

  return (
    <RoadmapForm
      initialData={currentRoadmap}
      onSubmit={handleSubmit}
      isEditing={true}
    />
  );
}