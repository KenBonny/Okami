# freezer-item-display Specification

## Purpose

Defines how freezer items are presented to the user across screen sizes, including expiration severity cues and inline editing, so the list stays readable and editable on phones and desktops alike.

## Requirements

### Requirement: Responsive presentation
The system SHALL present freezer items as a table on viewports at or above 768px wide and as a list of cards on viewports below 768px. Only one of the two SHALL be visible at a time.

#### Scenario: Wide viewport
- **WHEN** the viewport is 768px wide or more
- **THEN** the table is visible and the card list is hidden

#### Scenario: Narrow viewport
- **WHEN** the viewport is less than 768px wide
- **THEN** the card list is visible, the table is hidden, and no horizontal scrolling is needed to read an item

### Requirement: Action controls stay readable
The system SHALL NOT apply expiration severity colors to the edit, save, and delete controls or to the cells and card areas that contain them.

#### Scenario: Expired item in the table
- **WHEN** an item is expired and shown in the table
- **THEN** its edit and delete controls sit on an unstyled background and remain legible

#### Scenario: Expired item in a card
- **WHEN** an item is expired and shown as a card
- **THEN** its action controls sit on a neutral background and remain legible

### Requirement: Expiration severity cues
The system SHALL indicate an item's expiration severity (first warning, second warning, expired) with the severity background on its data cells and a left accent bar in the same severity color. Cards SHALL use the same severity colors and accent bar as table rows. Items with no warning SHALL show neither.

#### Scenario: Warning item in the table
- **WHEN** an item is within the first or second warning period
- **THEN** its data cells show the matching severity background and the first data cell shows the accent bar

#### Scenario: Warning item in a card
- **WHEN** the same item is shown as a card
- **THEN** the card shows the same severity color and accent bar

#### Scenario: Item without warning
- **WHEN** an item is not within any warning period
- **THEN** it shows no severity background and no accent bar

### Requirement: Card ordering
The system SHALL order cards by expiration date, soonest first, regardless of the table's sort field or direction. Cards SHALL NOT offer sort controls.

#### Scenario: Table sorted by description
- **WHEN** the table is sorted by description
- **THEN** the cards remain ordered by expiration date, soonest first

### Requirement: Shared filtering
The card list SHALL show exactly the items the table shows for the current search text and "include deleted" setting.

#### Scenario: Search narrows both views
- **WHEN** the user enters search text
- **THEN** the table and the card list both show only the matching items

#### Scenario: Include deleted
- **WHEN** the user turns on "include deleted"
- **THEN** deleted items appear in both the table and the card list

### Requirement: Inline editing on cards
The system SHALL let the user edit an item in place on its card. Edit mode SHALL show editable description, notes, and amount fields and a save control, and saving SHALL update the item in both views and persist it like a table edit.

#### Scenario: Edit and save
- **WHEN** the user taps edit on a card, changes the description, and taps save
- **THEN** the card returns to view mode showing the new description, and the table row shows it too

#### Scenario: Delete from a card
- **WHEN** the user taps delete on a card
- **THEN** the item is deleted exactly as a table delete would, in both views
