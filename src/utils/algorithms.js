
// https://www.mongodb.com/docs/manual/reference/method/cursor.skip/#pagination-example
// Tính toán giá trị skip phục vụ các tác vụ phân trang
export const pagingSkipValue = (page, itemsPerPage) => {
  // Luôn đảm bảo nếu giá trị không hợp lệ thì return về 0 hết
  if (!page || !itemsPerPage) return 0;
  if (page <= 0 || itemsPerPage <= 0) return 0;

  /**
     * ✔ Giải thích công thức đơn giản dễ hiểu:
     * Vì dụ trường hợp mỗi page hiển thị 12 bản ghi (itemsPerPage = 12)
     *
     * Case 01: User đứng ở page 1 (page = 1) thì sẽ lấy 1 - 1 = 0, sau đó nhân với 12 thì cũng = 0,
     *           lúc này giá trị skip là 0, nghĩa là **không skip bản ghi nào**
     *
     * Case 02: User đứng ở page 2 (page = 2) thì sẽ lấy 2 - 1 = 1, rồi nhân với 12 = 12,
     *           nghĩa là **skip 12 bản ghi của page trước đó**
     *
     * Case 03: User đứng ở page 5 (page = 5) thì sẽ lấy 5 - 1 = 4, rồi nhân với 12 = 48,
     *           nghĩa là **skip 48 bản ghi của các page trước đó**
     *
     * ...vv Tương tự với mọi page khác
     */
  return (page - 1) * itemsPerPage;
};
