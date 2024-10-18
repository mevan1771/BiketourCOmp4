import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { RootState } from '../store';
import { addActivity, removeActivity, reorderActivities, resetActivities } from '../store/tourSlice';
import { MapPin, Trash2, RefreshCw } from 'lucide-react';
import SortableItem from './SortableItem';
import GoogleMap from './GoogleMap';

const TourPlanner: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedActivities } = useSelector((state: RootState) => state.tour);
  const [distances, setDistances] = useState<{ from: string; to: string; distance: number }[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tourCategories = [
    {
      name: 'Safaris',
      activities: ['Yala National Park', 'Udawalawe National Park', 'Wilpattu National Park', 'Minneriya National Park', 'Bundala National Park'],
    },
    {
      name: 'City Tour',
      activities: ['Colombo Night Market', 'Galle Face Green at Night', 'Street Food Tour', 'Hidden Restaurant Tour'],
    },
    {
      name: 'Cultural Tour',
      activities: ['Sigiriya', 'Dambulla Cave Temple', 'Colombo Temple'],
    },
    {
      name: 'Adventure Tour',
      activities: ['Kithulgala Rafting', 'Ella Hiking', 'Mountain Biking in Knuckles Range'],
    },
    {
      name: 'Beach Experience',
      activities: ['Hikkaduwa Snorkeling', 'Mirissa Whale Watching', 'Bentota Water Sports'],
    },
  ];

  const calculateDistance = (from: string, to: string) => {
    return Math.floor(Math.random() * 100) + 20;
  };

  useEffect(() => {
    if (selectedActivities.length >= 2) {
      const newDistances = [];
      for (let i = 0; i < selectedActivities.length - 1; i++) {
        const from = selectedActivities[i].name;
        const to = selectedActivities[i + 1].name;
        const distance = calculateDistance(from, to);
        newDistances.push({ from, to, distance });
      }
      setDistances(newDistances);
    } else {
      setDistances([]);
    }
  }, [selectedActivities]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedActivities.findIndex((item) => item.id === active.id);
      const newIndex = selectedActivities.findIndex((item) => item.id === over.id);
      dispatch(reorderActivities(arrayMove(selectedActivities, oldIndex, newIndex)));
    }
  };

  const handleAddActivity = (activity: string, category: string) => {
    const id = `${category}-${activity}-${Date.now()}`;
    dispatch(addActivity({ id, name: activity, category }));
  };

  const handleRemoveActivity = (id: string) => {
    dispatch(removeActivity(id));
  };

  const handleSubmit = () => {
    navigate('/summary');
  };

  const handleReset = () => {
    dispatch(resetActivities());
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Plan Your Tour</h1>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 mb-4">
          <h2 className="text-2xl font-semibold mb-4">Available Activities</h2>
          {tourCategories.map((category) => (
            <div key={category.name} className="mb-4">
              <h3 className="text-xl font-medium mb-2">{category.name}</h3>
              <ul className="space-y-2">
                {category.activities.map((activity) => (
                  <li key={`${category.name}-${activity}`} className="flex items-center">
                    <button
                      onClick={() => handleAddActivity(activity, category.name)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 flex items-center"
                    >
                      <MapPin size={16} className="mr-2" />
                      {activity}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="w-full md:w-1/2 px-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Itinerary</h2>
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:border-gray-300 flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Reset
            </button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedActivities} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2 mt-4">
                {selectedActivities.map((activity) => (
                  <SortableItem key={activity.id} id={activity.id}>
                    <div className="bg-white p-3 rounded-md shadow-md flex items-center justify-between">
                      <span>{activity.name}</span>
                      <button
                        onClick={() => handleRemoveActivity(activity.id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </SortableItem>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          {selectedActivities.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">Tour Map</h3>
              <GoogleMap selectedActivities={selectedActivities} />
            </div>
          )}
          {distances.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">Estimated Distances</h3>
              <ul className="space-y-2">
                {distances.map((distance, index) => (
                  <li key={index} className="text-sm">
                    {distance.from} to {distance.to}: {distance.distance} km
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedActivities.length > 0 && (
            <button
              onClick={handleSubmit}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300"
            >
              Finalize Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourPlanner;