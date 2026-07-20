// repositories/commentRepository.test.js

// Mock model Comment trước khi import repository
jest.mock('../models/Comment', () => {
    const MockComment = jest.fn();

    MockComment.find = jest.fn();
    MockComment.findById = jest.fn();
    MockComment.findByIdAndDelete = jest.fn();
    MockComment.deleteMany = jest.fn();

    return MockComment;
});

const Comment = require('../models/Comment');
const commentRepository = require('./commentRepository');

/**
 * Tạo query giả để mô phỏng chuỗi query của Mongoose:
 *
 * Comment.find(...)
 *   .populate(...)
 *   .sort(...)
 *   .skip(...)
 *   .limit(...)
 *   .lean()
 */
const createQueryMock = (result) => {
    const query = {
        populate: jest.fn(),
        sort: jest.fn(),
        skip: jest.fn(),
        limit: jest.fn(),
        lean: jest.fn(),
    };

    // Mỗi hàm trả lại chính query để có thể gọi nối tiếp
    query.populate.mockReturnValue(query);
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockReturnValue(query);

    // lean() là bước cuối, trả về dữ liệu giả
    query.lean.mockResolvedValue(result);

    return query;
};

describe('Comment Repository Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findByStoryId', () => {
        test('Lấy danh sách comment gốc theo storyId với phân trang mặc định', async () => {
            // Arrange
            const storyId = 'story-123';

            const mockComments = [
                {
                    _id: 'comment-1',
                    storyId,
                    userId: {
                        username: 'user1',
                        fullName: 'User One',
                    },
                    content: 'Truyện rất hay',
                    parentId: null,
                },
                {
                    _id: 'comment-2',
                    storyId,
                    userId: {
                        username: 'user2',
                        fullName: 'User Two',
                    },
                    content: 'Mong ra chương mới',
                    parentId: null,
                },
            ];

            const queryMock = createQueryMock(mockComments);

            Comment.find.mockReturnValue(queryMock);

            // Act
            const result = await commentRepository.findByStoryId(storyId);

            // Assert
            expect(result).toEqual(mockComments);

            expect(Comment.find).toHaveBeenCalledWith({
                storyId,
                parentId: null,
            });

            expect(queryMock.populate).toHaveBeenCalledWith(
                'userId',
                'username fullName',
            );

            expect(queryMock.sort).toHaveBeenCalledWith({
                createdAt: -1,
            });

            // Mặc định page = 1 nên skip = 0
            expect(queryMock.skip).toHaveBeenCalledWith(0);

            // Mặc định limit = 20
            expect(queryMock.limit).toHaveBeenCalledWith(20);

            expect(queryMock.lean).toHaveBeenCalledTimes(1);
        });

        test('Tính skip chính xác khi truyền page và limit', async () => {
            // Arrange
            const storyId = 'story-123';
            const page = 3;
            const limit = 10;

            const queryMock = createQueryMock([]);

            Comment.find.mockReturnValue(queryMock);

            // Act
            const result = await commentRepository.findByStoryId(
                storyId,
                page,
                limit,
            );

            // Assert
            expect(result).toEqual([]);

            expect(Comment.find).toHaveBeenCalledWith({
                storyId,
                parentId: null,
            });

            // skip = (page - 1) * limit
            // skip = (3 - 1) * 10 = 20
            expect(queryMock.skip).toHaveBeenCalledWith(20);
            expect(queryMock.limit).toHaveBeenCalledWith(10);
        });

        test('Không lấy reply khi tìm comment gốc', async () => {
            // Arrange
            const storyId = 'story-123';
            const queryMock = createQueryMock([]);

            Comment.find.mockReturnValue(queryMock);

            // Act
            await commentRepository.findByStoryId(storyId);

            // Assert
            expect(Comment.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    storyId,
                    parentId: null,
                }),
            );
        });
    });

    describe('findReplies', () => {
        test('Lấy replies theo parentId và sắp xếp từ cũ đến mới', async () => {
            // Arrange
            const parentId = 'comment-parent-1';

            const mockReplies = [
                {
                    _id: 'reply-1',
                    parentId,
                    content: 'Reply đầu tiên',
                    userId: {
                        username: 'user1',
                        fullName: 'User One',
                    },
                },
                {
                    _id: 'reply-2',
                    parentId,
                    content: 'Reply thứ hai',
                    userId: {
                        username: 'user2',
                        fullName: 'User Two',
                    },
                },
            ];

            const queryMock = createQueryMock(mockReplies);

            Comment.find.mockReturnValue(queryMock);

            // Act
            const result = await commentRepository.findReplies(parentId);

            // Assert
            expect(result).toEqual(mockReplies);

            expect(Comment.find).toHaveBeenCalledWith({
                parentId,
            });

            expect(queryMock.populate).toHaveBeenCalledWith(
                'userId',
                'username fullName',
            );

            // Replies được sắp xếp tăng dần theo thời gian
            expect(queryMock.sort).toHaveBeenCalledWith({
                createdAt: 1,
            });

            expect(queryMock.lean).toHaveBeenCalledTimes(1);
        });
    });

    describe('findById', () => {
        test('Tìm comment thành công theo id', async () => {
            // Arrange
            const commentId = 'comment-123';

            const mockComment = {
                _id: commentId,
                content: 'Comment test',
                storyId: 'story-123',
                userId: 'user-123',
            };

            Comment.findById.mockResolvedValue(mockComment);

            // Act
            const result = await commentRepository.findById(commentId);

            // Assert
            expect(result).toEqual(mockComment);

            expect(Comment.findById).toHaveBeenCalledWith(commentId);
            expect(Comment.findById).toHaveBeenCalledTimes(1);
        });

        test('Trả về null khi không tìm thấy comment', async () => {
            // Arrange
            const commentId = 'not-found-id';

            Comment.findById.mockResolvedValue(null);

            // Act
            const result = await commentRepository.findById(commentId);

            // Assert
            expect(result).toBeNull();

            expect(Comment.findById).toHaveBeenCalledWith(commentId);
        });
    });

    describe('create', () => {
        test('Tạo và lưu comment thành công', async () => {
            // Arrange
            const commentData = {
                storyId: 'story-123',
                userId: 'user-123',
                content: 'Truyện rất hay',
                parentId: null,
            };

            const savedComment = {
                _id: 'comment-new-123',
                ...commentData,
                createdAt: new Date(),
            };

            const saveMock = jest.fn().mockResolvedValue(savedComment);

            // Khi gọi new Comment(commentData),
            // trả về object có hàm save giả
            Comment.mockImplementation(() => ({
                save: saveMock,
            }));

            // Act
            const result = await commentRepository.create(commentData);

            // Assert
            expect(result).toEqual(savedComment);

            expect(Comment).toHaveBeenCalledWith(commentData);
            expect(Comment).toHaveBeenCalledTimes(1);

            expect(saveMock).toHaveBeenCalledTimes(1);
        });

        test('Ném lỗi khi không thể lưu comment', async () => {
            // Arrange
            const commentData = {
                storyId: 'story-123',
                userId: 'user-123',
                content: '',
            };

            const databaseError = new Error('Không thể lưu comment');

            const saveMock = jest
                .fn()
                .mockRejectedValue(databaseError);

            Comment.mockImplementation(() => ({
                save: saveMock,
            }));

            // Act & Assert
            await expect(
                commentRepository.create(commentData),
            ).rejects.toThrow('Không thể lưu comment');

            expect(Comment).toHaveBeenCalledWith(commentData);
            expect(saveMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('delete', () => {
        test('Xóa comment thành công theo id', async () => {
            // Arrange
            const commentId = 'comment-123';

            const deletedComment = {
                _id: commentId,
                content: 'Comment đã bị xóa',
            };

            Comment.findByIdAndDelete.mockResolvedValue(
                deletedComment,
            );

            // Act
            const result = await commentRepository.delete(commentId);

            // Assert
            expect(result).toEqual(deletedComment);

            expect(
                Comment.findByIdAndDelete,
            ).toHaveBeenCalledWith(commentId);

            expect(
                Comment.findByIdAndDelete,
            ).toHaveBeenCalledTimes(1);
        });

        test('Trả về null khi comment cần xóa không tồn tại', async () => {
            // Arrange
            const commentId = 'not-found-id';

            Comment.findByIdAndDelete.mockResolvedValue(null);

            // Act
            const result = await commentRepository.delete(commentId);

            // Assert
            expect(result).toBeNull();

            expect(
                Comment.findByIdAndDelete,
            ).toHaveBeenCalledWith(commentId);
        });
    });

    describe('deleteReplies', () => {
        test('Xóa tất cả replies của comment cha', async () => {
            // Arrange
            const parentId = 'comment-parent-123';

            const deleteResult = {
                acknowledged: true,
                deletedCount: 3,
            };

            Comment.deleteMany.mockResolvedValue(deleteResult);

            // Act
            const result = await commentRepository.deleteReplies(
                parentId,
            );

            // Assert
            expect(result).toEqual(deleteResult);

            expect(Comment.deleteMany).toHaveBeenCalledWith({
                parentId,
            });

            expect(Comment.deleteMany).toHaveBeenCalledTimes(1);
        });

        test('Trả về deletedCount bằng 0 khi không có reply', async () => {
            // Arrange
            const parentId = 'comment-without-replies';

            const deleteResult = {
                acknowledged: true,
                deletedCount: 0,
            };

            Comment.deleteMany.mockResolvedValue(deleteResult);

            // Act
            const result = await commentRepository.deleteReplies(
                parentId,
            );

            // Assert
            expect(result.deletedCount).toBe(0);

            expect(Comment.deleteMany).toHaveBeenCalledWith({
                parentId,
            });
        });
    });

    describe('Database error', () => {
        test('Chuyển tiếp lỗi database khi findById thất bại', async () => {
            // Arrange
            const databaseError = new Error(
                'Database connection failed',
            );

            Comment.findById.mockRejectedValue(databaseError);

            // Act & Assert
            await expect(
                commentRepository.findById('comment-123'),
            ).rejects.toThrow('Database connection failed');
        });

        test('Chuyển tiếp lỗi database khi xóa replies thất bại', async () => {
            // Arrange
            const databaseError = new Error(
                'Delete operation failed',
            );

            Comment.deleteMany.mockRejectedValue(databaseError);

            // Act & Assert
            await expect(
                commentRepository.deleteReplies('parent-123'),
            ).rejects.toThrow('Delete operation failed');
        });
    });
});