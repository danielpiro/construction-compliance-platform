import React from "react";

/*
 * This is a helper component to fix the issue with MUI Menu components
 * that don't accept React.Fragment as children.
 *
 * Usage:
 * Replace:
 * <Menu>
 *   <>
 *     <MenuItem>Item 1</MenuItem>
 *     <MenuItem>Item 2</MenuItem>
 *   </>
 * </Menu>
 *
 * With:
 * <Menu>
 *   <MenuItemsWrapper>
 *     <MenuItem>Item 1</MenuItem>
 *     <MenuItem>Item 2</MenuItem>
 *   </MenuItemsWrapper>
 * </Menu>
 */

export const MenuItemsWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Convert children to array if they're wrapped in a Fragment
  const childrenArray = React.Children.toArray(children);
  return <>{childrenArray}</>;
};

export default MenuItemsWrapper;
