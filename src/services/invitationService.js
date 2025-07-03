import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatter'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người đi mời: chính là người đang request
    const inviter = await userModel.findOneById(inviterId)

    // Người được mời: lấy theo email gửi từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)

    // Lấy thông tin board
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu 1 trong 3 không tồn tại → báo lỗi 404
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Tạo dữ liệu lời mời để lưu vào DB
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Ghi vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)

    // Truy vấn lại invitation để lấy dữ liệu đầy đủ (có thể populate hoặc format khác)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

    // Trả kết quả về cho FE, bao gồm cả thông tin board và người liên quan
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    // Biến đổi dữ liệu inviter, invitee thành 1 obj thay vì mảng
    const resInvitations = getInvitations.map(invitation => (
      {
        ...invitation,
        inviter: invitation.inviter[0] || {},
        invitee: invitation.invitee[0] || {},
        board: invitation.board[0] || {}
      }
    ))

    return resInvitations
  } catch (error) {
    throw error
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // Tìm bản ghi invitation trong model
    const getInvitation = await invitationModel.findOneById(invitationId);
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!');

    // Sau khi có Invitation rồi thì lấy full thông tin của board
    const boardId = getInvitation.boardInvitation.boardId;
    const getBoard = await boardModel.findOneById(boardId);
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!');

    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.CONFLICT, 'You are already a member of this board')
    }

    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status
      },
      updatedAt: Date.now()
    }

    const updatedInvitation = await invitationModel.update(invitationId, updateData)

    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}
