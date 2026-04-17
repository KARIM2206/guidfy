// app/(admin)/roadmaps/create/page.jsx
'use client';

import { useRoadmaps } from '../../../../hooks/useRoadmaps';
import RoadmapForm from '../../../../components/admin/dashboard/roadmap/RoadmapForm';

export default function CreateRoadmapPage() {
  const { createRoadmap } = useRoadmaps();

  const handleSubmit = async (data) => {
    await createRoadmap(data);
  };

  return <RoadmapForm onSubmit={handleSubmit} isEditing={false} />;
}