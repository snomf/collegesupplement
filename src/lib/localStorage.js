import schoolData from '../data.json';

const getInitialData = () => {
  const data = localStorage.getItem('questrack-data');
  if (data) {
    return JSON.parse(data);
  }

  // Seed initial data from the static json file
  const initialData = {
    userSchools: [],
    checklists: {}, // { "schoolName": [{ "id": 1, "item": "...", "status": "..." }] }
    customDeadlines: [],
    recentActivities: [],
  };
  localStorage.setItem('questrack-data', JSON.stringify(initialData));
  return initialData;
};

const saveData = (data) => {
  localStorage.setItem('questrack-data', JSON.stringify(data));
};

export const getAllData = () => {
  return getInitialData();
};

export const getAllSchools = () => {
    return schoolData;
}

export const getUserSchools = () => {
  const data = getInitialData();
  return data.userSchools.map(schoolName =>
    schoolData.find(s => s.college_name === schoolName)
  );
};

export const addUserSchool = (schoolName) => {
  const data = getInitialData();
  if (!data.userSchools.includes(schoolName)) {
    data.userSchools.push(schoolName);
    // Initialize checklist for the new school
    const school = schoolData.find(s => s.college_name === schoolName);
    if (school && school.supplements_data && school.supplements_data.supplements) {
      data.checklists[schoolName] = school.supplements_data.supplements.map((item, index) => ({
        id: index + 1,
        item: item.name,
        prompt: item.prompt,
        is_optional: item.is_optional,
        status: 'Not Started',
      }));
    }
    saveData(data);
  }
};

export const removeUserSchool = (schoolName) => {
  const data = getInitialData();
  data.userSchools = data.userSchools.filter(name => name !== schoolName);
  delete data.checklists[schoolName];
  saveData(data);
};

export const getChecklist = (schoolName) => {
  const data = getInitialData();
  return data.checklists[schoolName] || [];
};

export const updateChecklistItem = (schoolName, itemId, newStatus) => {
  const data = getInitialData();
  if (data.checklists[schoolName]) {
    const item = data.checklists[schoolName].find(i => i.id === itemId);
    if (item) {
      item.status = newStatus;
      saveData(data);
    }
  }
};

export const getCustomDeadlines = () => {
  const data = getInitialData();
  return data.customDeadlines;
};

export const addCustomDeadline = (deadline) => {
  const data = getInitialData();
  data.customDeadlines.push(deadline);
  saveData(data);
};

export const getRecentActivities = () => {
    const data = getInitialData();
    return data.recentActivities;
};

export const addRecentActivity = (activity) => {
    const data = getInitialData();
    // Keep the list to a reasonable size
    if(data.recentActivities.length > 10) {
        data.recentActivities.shift();
    }
    data.recentActivities.push(activity);
    saveData(data);
};
