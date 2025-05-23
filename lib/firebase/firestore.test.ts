import {
  createComment,
  getComments,
  setRating,
  getRating,
  getAverageRating,
} from "./firestore"; // Adjust path as necessary
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import type { CommentInput, RatingInput } from "../types";

// Mock Date.now() for consistent timestamps
const FIXED_TIMESTAMP = 1678886400000; // March 15, 2023
jest.spyOn(Date, 'now').mockImplementation(() => FIXED_TIMESTAMP);

jest.mock("firebase/firestore", () => {
  const originalModule = jest.requireActual("firebase/firestore");
  return {
    ...originalModule,
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn((db, path) => ({ path })), // Return a mock collection ref object
    doc: jest.fn((db, collectionPath, id) => ({ path: `${collectionPath}/${id}` })), // Return a mock doc ref
    query: jest.fn((collectionRef, ...constraints) => ({ collectionRef, constraints })), // Return a mock query
    where: jest.fn((fieldPath, opStr, value) => ({ type: 'where', fieldPath, opStr, value })),
    orderBy: jest.fn((fieldPath, directionStr) => ({ type: 'orderBy', fieldPath, directionStr })),
    limit: jest.fn((count) => ({ type: 'limit', count })),
    Timestamp: {
      now: jest.fn(() => ({
        // toMillis: jest.fn().mockReturnValue(Date.now()) - use FIXED_TIMESTAMP
        toMillis: jest.fn().mockReturnValue(FIXED_TIMESTAMP)
      })),
    },
  };
});

// Helper to create mock QuerySnapshot
const createMockQuerySnapshot = (docsData: DocumentData[]): QuerySnapshot<DocumentData> => {
  const mockDocs = docsData.map((data, index) => ({
    id: `doc-${index}`,
    data: () => data,
    exists: () => true, // Assuming docs exist if they are in the snapshot
  })) as QueryDocumentSnapshot<DocumentData>[];

  return {
    empty: mockDocs.length === 0,
    docs: mockDocs,
    size: mockDocs.length,
    forEach: (callback) => mockDocs.forEach(callback),
    // Add other QuerySnapshot properties if needed by your functions
  } as QuerySnapshot<DocumentData>;
};


describe("Comments Firestore Functions", () => {
  const mockAddDoc = addDoc as jest.Mock;
  const mockGetDocs = getDocs as jest.Mock;
  const mockCollection = collection as jest.Mock;
  const mockQuery = query as jest.Mock;
  const mockWhere = where as jest.Mock;
  const mockOrderBy = orderBy as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockAddDoc.mockClear();
    mockGetDocs.mockClear();
    mockCollection.mockClear();
    mockQuery.mockClear();
    mockWhere.mockClear();
    mockOrderBy.mockClear();
    (Timestamp.now as jest.Mock).mockReturnValue({ toMillis: jest.fn().mockReturnValue(FIXED_TIMESTAMP) });
  });

  describe("createComment", () => {
    it("should create a new comment with correct data and generated createdAt timestamp", async () => {
      mockAddDoc.mockResolvedValue({ id: "new-comment-id" });
      const commentInput: CommentInput = {
        storyId: "story1",
        userId: "user1",
        userName: "Test User",
        text: "This is a test comment",
        userAvatar: "avatar.png",
      };

      const commentId = await createComment(commentInput);

      expect(commentId).toBe("new-comment-id");
      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "comments");
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "comments" }), // Check if collection ref is for 'comments'
        expect.objectContaining({
          ...commentInput,
          createdAt: FIXED_TIMESTAMP.toString(),
        })
      );
    });
  });

  describe("getComments", () => {
    it("should retrieve comments for a given storyId, ordered by createdAt descending", async () => {
      const storyId = "story1";
      const mockCommentsData = [
        { storyId, userId: "user1", text: "Comment 1", createdAt: (FIXED_TIMESTAMP - 1000).toString(), userName: "User A" },
        { storyId, userId: "user2", text: "Comment 2", createdAt: FIXED_TIMESTAMP.toString(), userName: "User B" },
      ];
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(mockCommentsData));

      const comments = await getComments(storyId);

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "comments");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "comments" }),
        expect.objectContaining({ type: 'where', fieldPath: "storyId", opStr: "==", value: storyId }),
        expect.objectContaining({ type: 'orderBy', fieldPath: "createdAt", directionStr: "desc" })
      );
      expect(comments).toHaveLength(2);
      expect(comments[0]).toEqual(expect.objectContaining({ id: 'doc-0', ...mockCommentsData[0] }));
      expect(comments[1]).toEqual(expect.objectContaining({ id: 'doc-1', ...mockCommentsData[1] }));
    });

    it("should return an empty array if no comments exist for a storyId", async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]));
      const comments = await getComments("non-existent-story-id");
      expect(comments).toEqual([]);
    });
  });
});

describe("Ratings Firestore Functions", () => {
  const mockAddDoc = addDoc as jest.Mock;
  const mockGetDocs = getDocs as jest.Mock;
  const mockUpdateDoc = updateDoc as jest.Mock;
  const mockCollection = collection as jest.Mock;
  const mockDoc = doc as jest.Mock;
  const mockQuery = query as jest.Mock;
  const mockWhere = where as jest.Mock;
  const mockLimit = limit as jest.Mock;


  beforeEach(() => {
    mockAddDoc.mockClear();
    mockGetDocs.mockClear();
    mockUpdateDoc.mockClear();
    mockCollection.mockClear();
    mockDoc.mockClear();
    mockQuery.mockClear();
    mockWhere.mockClear();
    mockLimit.mockClear();
    (Timestamp.now as jest.Mock).mockReturnValue({ toMillis: jest.fn().mockReturnValue(FIXED_TIMESTAMP) });

  });

  describe("setRating", () => {
    const ratingInput: RatingInput = {
      storyId: "story1",
      userId: "user1",
      value: 5,
    };

    it("should create a new rating if one does not exist for the user and story", async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([])); // No existing rating
      mockAddDoc.mockResolvedValue({ id: "new-rating-id" });

      await setRating(ratingInput);

      expect(mockCollection).toHaveBeenCalledWith(expect.anything(), "ratings");
      // First getDocs call for checking existence
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        expect.objectContaining({ type: 'where', fieldPath: "storyId", opStr: "==", value: ratingInput.storyId }),
        expect.objectContaining({ type: 'where', fieldPath: "userId", opStr: "==", value: ratingInput.userId }),
        expect.objectContaining({ type: 'limit', count: 1 })
      );
      // Then addDoc call
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        expect.objectContaining({
          ...ratingInput,
          createdAt: FIXED_TIMESTAMP.toString(),
          updatedAt: FIXED_TIMESTAMP.toString(),
        })
      );
    });

    it("should update an existing rating if one exists for the user and story", async () => {
      const existingRatingId = "existing-rating-doc-id";
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([{ ...ratingInput, id: existingRatingId, createdAt: (FIXED_TIMESTAMP - 1000).toString() }]));
      mockUpdateDoc.mockResolvedValue(undefined);
      
      // Update the value
      const newRatingInput: RatingInput = { ...ratingInput, value: 4 };
      await setRating(newRatingInput);
      
      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), "ratings", existingRatingId);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: `ratings/${existingRatingId}` }),
        {
          value: newRatingInput.value,
          updatedAt: FIXED_TIMESTAMP.toString(),
        }
      );
    });
  });

  describe("getRating", () => {
    const storyId = "story1";
    const userId = "user1";

    it("should retrieve a specific rating for a user and story", async () => {
      const mockRatingData = { storyId, userId, value: 4, createdAt: FIXED_TIMESTAMP.toString() };
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([mockRatingData]));

      const rating = await getRating(storyId, userId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        expect.objectContaining({ type: 'where', fieldPath: "storyId", opStr: "==", value: storyId }),
        expect.objectContaining({ type: 'where', fieldPath: "userId", opStr: "==", value: userId }),
        expect.objectContaining({ type: 'limit', count: 1 })
      );
      expect(rating).toEqual(expect.objectContaining({id: 'doc-0', ...mockRatingData}));
    });

    it("should return null if no rating exists for the user and story", async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]));
      const rating = await getRating(storyId, "non-existent-user");
      expect(rating).toBeNull();
    });
  });

  describe("getAverageRating", () => {
    const storyId = "story1";

    it("should calculate the correct average rating for a story", async () => {
      const mockRatingsData = [
        { storyId, userId: "user1", value: 5 },
        { storyId, userId: "user2", value: 4 },
        { storyId, userId: "user3", value: 3 },
      ];
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot(mockRatingsData));

      const average = await getAverageRating(storyId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ path: "ratings" }),
        expect.objectContaining({ type: 'where', fieldPath: "storyId", opStr: "==", value: storyId })
      );
      expect(average).toBe(4); // (5+4+3)/3
    });

    it("should return 0 if there are no ratings for a story", async () => {
      mockGetDocs.mockResolvedValue(createMockQuerySnapshot([]));
      const average = await getAverageRating(storyId);
      expect(average).toBe(0);
    });
  });
});
