use wasm_bindgen::prelude::*;

extern crate js_sys;
extern crate fixedbitset;
extern crate wee_alloc;

use fixedbitset::FixedBitSet;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
}

#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        let width = 64;
        let height = 64;
        let size = (width * height) as usize;
        let mut cells = FixedBitSet::with_capacity(size);
        
        for i in 0..size {
            cells.set(i, js_sys::Math::random() < 0.5);
        }
        Universe{
            width,
            height,
            cells
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    fn get_index(&self, row: u32, col: u32) -> usize {
        (row * self.width + col) as usize
    }

    fn live_neighbour_count(&self, row: u32, col: u32) -> u8 {
        let mut count: u8 = 0;
        
        for delta_row in (vec![self.height - 1, 0 , 1]).iter().cloned(){
            for delta_col in (vec![self.width - 1, 0 , 1]).iter().cloned(){
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }
                let neighbour_row = (row + delta_row) % self.height;
                let neighbour_col = (col + delta_col) % self.width;
                let idx = self.get_index(neighbour_row, neighbour_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    pub fn tick(&mut self){
        let mut next = self.cells.clone();
        for row in 0..self.height{
            for col in 0..self.width{
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbour_count(row, col);

                let enabled = match (cell, live_neighbors) {
                    (true, x) if x < 2 => false,
                    (true, x) if x == 2 || x == 3 => true,
                    (true, x) if x > 3 => false,
                    (false, x) if x == 3 => true,
                    (otherwise, _) => otherwise
                };
                
                next.set(idx, enabled)
            }
        }

        self.cells = next;
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        self.cells.toggle(idx);
    }
}

impl Default for Universe {
    fn default() -> Self {
        Self::new()
    }
}

impl Universe{
    /// Set the width of the universe.
    ///
    /// Resets all cells to the dead state.

    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells.set_range(0..self.cells.len(), false);
    }

    /// Set the height of the universe.
    ///
    /// Resets all cells to the dead state.
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells.set_range(0..self.cells.len(), false);
    }

    pub fn set_cells(&mut self, cells: &[(u32, u32)]){
        for cell in cells{
            let idx = self.get_index(cell.0, cell.1);
            self.cells.set(idx, true);
        }
    }

    pub fn get_cells(&self) -> Vec<u32> {
        let mut p = vec![];
        for i in self.cells.as_slice().iter(){
            p.push(*i)
        }
        p
    }
}
