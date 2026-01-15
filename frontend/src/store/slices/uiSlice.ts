import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    isSidebarCollapsed: boolean;
    floors: string[];
}

const initialState: UiState = {
    isSidebarCollapsed: false,
    floors: ['Frontend', 'Backend', 'DevOps', 'Conference', 'Games'],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarCollapsed = !state.isSidebarCollapsed;
        },
        addFloor: (state, action: PayloadAction<string>) => {
            state.floors.push(action.payload);
        },
    },
});

export const { toggleSidebar, addFloor } = uiSlice.actions;
export default uiSlice.reducer;
