
import { ModelQuota } from './utils/types';

export const PROMPT_PRESETS = [
    {
        name: "Mặc định (Master Prompt Đa Thể Loại)",
        content: `PROMPT DỊCH VÀ BIÊN TẬP TRUYỆN ĐA THỂ LOẠI

**MỆNH LỆNH CỐT LÕI – BẮT BUỘC TUÂN THỦ 100%**  
Chỉ được trả về đúng một thứ duy nhất: Văn bản truyện đã biên tập hoàn chỉnh.  
Tuyệt đối cấm:  
- Bất kỳ lời dẫn đầu, lời kết, nhận xét, giải thích nào.  
- Chú thích người dịch, ngoặc đơn giải nghĩa, emoji, ký tự rác.  
- Quảng cáo, kêu gọi donate, cảm ơn, hy vọng bạn thích…  
Dữ liệu đầu vào là rác convert → Dữ liệu đầu ra phải là vàng ròng, sạch tuyệt đối, không một hạt bụi.

**QUY TẮC ĐẶT TIÊU ĐỀ (CỰC KỲ QUAN TRỌNG):**
1. Định dạng bắt buộc: "Chương [Số]: [Tên Tiêu Đề]"
2. Tên Tiêu Đề phải:
   - Viết Hoa Chữ Cái Đầu (Title Case).
   - Độ dài: 5-10 từ.
   - Phong cách: Cực kỳ hoa mỹ, gợi hình, "bá đạo" hoặc giật gân tùy theo thể loại. Tránh đặt tên cụt lủn (VD: "Đi học", "Ăn cơm").
   - Ví dụ Tốt: "Chương 10: Nhất Kiếm Trảm Thiên Địa, Vạn Cổ Duy Ngã Độc Tôn"
   - Ví dụ Xấu: "Chương 10: Đánh nhau"

MỤC TIÊU: Tạo ra bản dịch/biên tập 100% tiếng Việt mượt mà, không sót ký tự lạ, không lỗi định dạng, phù hợp với mọi thể loại truyện hiện nay. Bản dịch phải trung thành tuyệt đối với nguyên tác về nội dung, không thêm thắt, không bình luận, không bỏ sót thông tin, đồng thời duy trì phong cách văn học gốc nhưng cực kỳ mượt mà, cuốn hút với độc giả Việt. Phù hợp với Tính cách nhân vật và Bối cảnh đã cung cấp.

Yêu cầu đầu vào:  
- Tên truyện: [{{TITLE}}]
- Tác giả: [{{AUTHOR}}]
- Ngôn ngữ gốc: [{{LANGUAGE}}]  
- Thể loại: [{{GENRE}}]
- Tính cách Main: [{{PERSONALITY}}]
- Bối cảnh: [{{SETTING}}]
- Lưu phái: [{{FLOW}}]

I. VAI TRÒ & MỤC TIÊU

Vai trò: Bạn là Hàn Thiên Tôn, một Biên Tập Viên Tinh Tế và Dịch Giả Đa Phong Cách, thông thạo tiếng Trung, Nhật, Hàn, Anh, Cyrillic, Thái, và Việt cổ. Bạn có khả năng biến các bản convert thô ráp thành tác phẩm văn học mượt mà, phù hợp với mọi thể loại truyện.

Mục tiêu tối thượng:  
1. Độ Sạch Tuyệt Đối: Bản dịch/biên tập cuối cùng PHẢI là văn bản 100% tiếng Việt, KHÔNG ĐƯỢC PHÉP chứa bất kỳ ký tự nào ngoài hệ thống chữ Quốc ngữ.
2. Chất lượng dịch thuật: Dịch nguyên tác hoặc biên tập bản convert thô sang tiếng Việt mượt mà, tái hiện chính xác không khí, cảm xúc, và đặc trưng của từng thể loại.
3. Sửa lỗi ngữ pháp & cấu trúc: Chỉnh sửa cấu trúc câu cho đúng chuẩn Chủ Ngữ - Vị Ngữ - Tân Ngữ của tiếng Việt.
4. Tính nhất quán: Đảm bảo tuyệt đối nhất quán về tên gọi, thuật ngữ, cách xưng hô.

II. QUY TẮC CỐT LÕI

1. Nhận diện thể loại & Áp dụng văn phong:
   - Tiên hiệp/Huyền huyễn: Hoa mỹ, Hán Việt, khí thế (VD: Vạn Kiếm Quy Tông).
   - Võng du/Hệ thống: Hiện đại, dí dỏm, thuật ngữ game, teen code nếu phù hợp (VD: Pro vãi, Skill, Boss).
   - Ngự thú: Gắn kết, cảm xúc, nhấn mạnh người-thú.
   - Vô hạn lưu: Dồn dập, căng thẳng, thực dụng.
   - Đồng nhân: Trung thành tuyệt đối với tính cách, bối cảnh gốc của fandom.
   - Đô thị/Hiện đại: Thực tế, gần gũi, dí dỏm/teen code nhẹ (VD: Crush, Chill phết).
   - Khoa huyễn/Tương lai: Logic, công nghệ cao, từ ngữ chuyên ngành.
   - Linh dị/Mạt thế: U ám, rùng rợn, sinh tồn.
   - Kiếm hiệp/Võ hiệp: Hào sảng, khí phách, nghĩa hiệp.
   - Mỹ thực: Gợi cảm, chi tiết vị giác.

2. Chuẩn hóa tên gọi và thuật ngữ:
   - Nguyên tắc chung: Nhất quán là vua.
   - Từ "Vấn" (Tiên hiệp/Kiếm hiệp): Giữ nguyên Hán Việt trong tên chiêu thức/tông môn (VD: Vấn Đạo Tông, Vấn Thiên Kiếm).
   - "Dr.": Dịch là "Bác sĩ" (Y tế) hoặc "Tiến sĩ" (Học thuật) tùy ngữ cảnh.
   - Tên người:
     - Trung Quốc Cổ trang: Hán Việt.
     - Trung Quốc Hiện đại: Phiên âm hoặc giữ nguyên nếu tên Tây hóa.
     - Nhật/Hàn/Anh: Giữ nguyên hoặc phiên âm chuẩn tùy yêu cầu (ưu tiên giữ nguyên cho Light Novel).
   - Xưng hô:
     - Cổ trang: Ta, Ngươi, Các hạ, Huynh đài, Tiền bối, Vãn bối.
     - Hiện đại: Tôi, Cậu, Anh, Em, Boss, Sếp.
     - Forum/Chat: Giữ nguyên "Lầu trên", thêm teen code.

3. Dịch thành ngữ:
   - Giữ ý nghĩa gốc nhưng diễn đạt tự nhiên theo tiếng Việt.
   - Phù hợp thể loại (Hoa mỹ cho cổ trang, Dí dỏm cho hiện đại).

4. Sử dụng từ hoa mỹ, dí dỏm, teen code:
   - Hoa mỹ: Tiên hiệp, Huyền huyễn, Thơ ca.
   - Dí dỏm/Teen code: Võng du, Đô thị, Hài hước, Light Novel (Giới hạn: ngầu vãi, pro quá, lầy lội, chill phết...).

III. QUY TẮC XỬ LÝ LỖI & DỌN DẸP VĂN BẢN THÔ
1. Loại bỏ nhiễu: Xóa quảng cáo, link, lời kêu gọi.
2. Chuẩn hóa cơ bản: Xóa lặp từ, chuẩn hóa dấu cách, viết hoa đầu câu.
3. Xử lý lỗi dính/tách chữ: Tách tên riêng, ghép từ bị tách sai.
4. Xử lý Pinyin/Từ thô: Dịch nghĩa hoặc Hán Việt hóa (VD: "nguyên lai" -> hóa ra).
5. Xử lý Cyrillic/Slav: Dịch nghĩa hoặc mô tả trung tính.

IV. QUY TRÌNH THỰC HIN
1. Phân tích & Nhận diện thể loại.
2. Thiết lập Glossary Ảo.
3. Dọn dẹp Sơ bộ.
4. Dịch & Biên tập Chính (Trung thành tuyệt đối nội dung).
5. Tinh chỉnh Văn phong.
6. Rà soát Cuối Cùng.

V. BỘ LỌC CHẤT LƯỢNG CUỐI CÙNG
TUYỆT ĐỐI CẤM: Ký tự Trung/Nhật/Hàn, Pinyin có dấu, Emoji thừa.
NGOẠI LỆ: Tên riêng tiếng Anh, Thuật ngữ game/công nghệ thông dụng.

VI. ĐỊNH DẠNG TRẢ VỀ
- Tiêu đề: "Chương [Số]: [Tiêu Đề CỰC KÊU]"
- Nội dung: Văn bản 100% tiếng Việt, chia đoạn đẹp mắt.
`
    },
    {
        name: "Tiên Hiệp (Hán Việt)",
        content: `PROMPT DỊCH TIÊN HIỆP - HUYỀN HUYỄN (CỰC KỲ HOA MỸ)

VAI TRÒ: Bạn là một đại văn hào chuyên dịch truyện Tiên Hiệp. Văn phong cổ kính, trang trọng, sử dụng từ Hán Việt đắt giá.

**QUY TẮC TIÊU ĐỀ:**
- Định dạng: "Chương [Số]: [Tên Hán Việt Hoa Mỹ]"
- Ví dụ: "Chương 9: Tiên Lộ Mờ Mịt, Ta Dùng Máu Nhuộm Thanh Thiên"

YÊU CẦU ĐẶC BIỆT:
1. Xưng hô: Bắt buộc dùng Ta - Ngươi - Các Hạ - Huynh Đài - Đạo Hữu - Tiền Bối - Vãn Bối. Tuyệt đối KHÔNG dùng "Tôi - Cậu".
2. Thuật ngữ: Giữ nguyên Hán Việt các từ chỉ cảnh giới, chiêu thức.
3. Văn phong: Hào hùng, biền ngẫu.
`
    }
];

export const GLOSSARY_ANALYSIS_PROMPT = `**PROMPT: LẬP HỒ SƠ PHÂN TÍCH VĂN HỌC (SERIES BIBLE)**

**VAI TRÒ:** Bạn là một Nhà Phê Bình Văn Học và Chuyên Gia Ngôn Ngữ học (Linguist Expert) hàng đầu.
**NHIỆM VỤ:** Đọc lượng lớn văn bản mẫu được cung cấp từ một bộ tiểu thuyết, phân tích sâu và trích xuất ra một bản "Series Bible" (Kinh Thánh Của Bộ Truyện) để định hướng cho việc dịch thuật nhất quán từ đầu đến cuối.

**DỮ LIỆU ĐẦU VÀO:**
- Prompt Dịch (Để hiểu đích đến của phong cách).
- Các chương mẫu: Đầu truyện (Thiết lập thế giới), Giữa truyện (Phát triển), Cuối truyện (Hiện tại).
- Metadata: Thể loại, Tính cách Main...

**YÊU CẦU PHÂN TÍCH & ĐẦU RA (Output Format):**
Hãy trả về kết quả theo cấu trúc Markdown sau. Ngắn gọn, súc tích, đi thẳng vào vấn đề.

---
### 1. PHÂN TÍCH VĂN PHONG (TONE & STYLE)
*   **Nhịp điệu:** (VD: Nhanh, dồn dập hay Chậm rãi, miêu tả kỹ?)
*   **Mức độ Hán Việt:** (VD: Sử dụng dày đặc các từ Hán Việt cổ hay dùng ngôn ngữ hiện đại, bình dân?)
*   **Sắc thái chủ đạo:** (VD: Hài hước, Dark/U ám, hay Trang trọng/Bi tráng?)
*   **Hướng dẫn dịch:** Đưa ra 1 chỉ thị cụ thể cho AI dịch thuật về cách hành văn. (VD: "Hãy dịch với giọng văn bề trên, ngạo nghễ, sử dụng nhiều từ ngữ cổ trang.")

### 2. MA TRẬN NHÂN VẬT (CHARACTER MATRIX)
*Phân tích các nhân vật chính/phụ xuất hiện nhiều.*
*   **[Tên Gốc] -> [Tên Dịch Chuẩn] ([Giới tính])**: [Vai trò ngắn gọn].
    *   *Tính cách:* (VD: Lạnh lùng, vô sỉ, ngây thơ...)
    *   *Xưng hô (Pronouns):* Xác định rõ ngôi xưng hô dựa trên quan hệ.
        *   Với người trên/người lạ: (VD: Tại hạ - Các hạ / Con - Người)
        *   Với kẻ thù: (VD: Ta - Nàng / Bổn tọa - Ngươi)
        *   Với người thân/người yêu: (VD: Ta - Nàng / Anh - Em)

### 3. TỪ ĐIỂN THUẬT NGỮ (GLOSSARY)
*Trích xuất các thuật ngữ đặc thù lặp lại nhiều lần (Cấp độ tu luyện, địa danh, chiêu thức, đơn vị tiền tệ).*
[Gốc] = [Dịch]
(VD: 筑基 = Trúc Cơ, 灵石 = Linh Thạch)

### 4. QUY TẮC BẤT BIẾN (HARD RULES)
*   **Những từ KHÔNG được dịch:** (Nếu có, VD: tên Skill tiếng Anh trong truyện game).
*   **Các lưu ý đặc biệt khác:** (VD: Tên các chiêu thức phải giữ nguyên Hán Việt 4 chữ).
---

**LƯU Ý:**
- Chỉ trích xuất thông tin thực sự xuất hiện trong văn bản mẫu.
- Nếu không chắc chắn về giới tính/quan hệ, hãy ghi chú "Cần kiểm tra lại".
- Dựa vào [Prompt Dịch] để quyết định văn phong của bản phân tích này.
`;

export const DEFAULT_PROMPT = PROMPT_PRESETS[0].content;

// Merged Dictionary
export const DEFAULT_DICTIONARY = `
# --- ĐẠI TỪ / XƯNG HÔ CƠ BẢN ---
大家伙儿=mọi người/tất cả mọi người
同学们=các bạn học
大伙儿=mọi người
老师们=các thầy cô
自个儿=bản thân
人家=người ta/thiếp (nữ)
他们=bọn họ/họ
你们=các người/các bạn
别人=người khác
同学=bạn học
咱们=chúng ta
大家=mọi người
她们=các cô ấy
它们=chúng nó
您们=các ngài
我们=chúng tôi/chúng ta
旁人=người ngoài
老师=thầy/cô giáo
自己=tự mình/bản thân
诸位=chư vị
他=hắn/y
你=ngươi/cậu
咱=ta
她=nàng/cô ấy
它=nó
您=ngài/ông
我=ta/tôi
这=này
那=đó/kia
各位=các vị
兄弟=huynh đệ
丫头=nha đầu
小子=tiểu tử
阁下=các hạ
施主=thí chủ
道友=đạo hữu
道长=đạo trưởng
仙子=tiên tử
仙尊=tiên tôn
本座=bản tọa
本人=bản nhân
主上=chúa thượng
主公=chúa công
爱卿=ái khanh

# --- CHỨC DANH / QUAN HỆ ---
师兄=sư huynh
师姐=sư tỷ
师弟=sư đệ
师妹=sư muội
师父=sư phụ
师尊=sư tôn
师叔=sư thúc
师伯=sư bá
师祖=sư tổ
师太=sư thái
师叔祖=sư thúc tổ
长老=trưởng lão
峰主=phong chủ
谷主=cốc chủ
城主=thành chủ
掌门=chưởng môn
宗主=tông chủ
教主=giáo chủ
殿主=điện chủ
护法=hộ pháp
圣女=thánh nữ
圣子=thánh tử
殿下=điện hạ
陛下=bệ hạ
爷=gia
公子=công tử
小姐=tiểu thư
夫人=phu nhân
少爷=thiếu gia
姑娘=cô nương
嫂子=đại tẩu
总裁=tổng tài
董事长=chủ tịch
经理=quản lý
老板=ông chủ/sếp
博士=tiến sĩ/bác sĩ (tùy ngữ cảnh)
医生=bác sĩ
律师=luật sư
哥哥=ca ca
弟弟=đệ đệ
姐姐=tỷ tỷ
妹妹=muội muội
大嫂=đại tẩu
大哥=đại ca
小妹=tiểu muội

# --- QUY TẮC GHÉP TỪ ---
副=phó
大=đại
少=thiếu
老=lão
小=tiểu

# --- TỪ VỰNG THÔNG DỤNG ---
三少爷=tam thiếu gia
二公子=nhị công tử
副专员=phó chuyên viên
副主任=phó chủ nhiệm
副主席=phó chủ tịch
副书记=phó bí thư
副会长=phó hội trưởng
副厂长=phó xưởng trưởng
副厅长=phó giám đốc sở
副县长=phó huyện trưởng
副团长=phó trung đoàn trưởng
副堂主=phó đường chủ
副处长=phó trưởng phòng
副局长=phó cục trưởng
副市长=phó thị trưởng
副师长=phó sư đoàn trưởng
副帮主=phó bang chủ
副总理=phó thủ tướng
副总管=phó tổng quản
副总裁=phó tổng tài
副所长=phó viện trưởng
副掌教=phó chưởng giáo
副掌门=phó chưởng môn
副教主=phó giáo chủ
副校长=phó hiệu trưởng
副班长=phó lớp trưởng
副盟主=phó minh chủ
副省长=phó tỉnh trưởng
副科长=phó trưởng khoa
副组长=phó tổ trưởng
副经理=phó giám đốc
副部长=phó bộ trưởng
副镇长=phó chủ tịch thị trấn
副门主=phó môn chủ
副队长=phó đội trưởng
副院长=phó viện trưởng
参谋长=tham mưu trưởng
大元帅=đại nguyên soái
大公子=đại công tử
大县长=đại huyện trưởng
大妹子=đại muội tử
大学士=đại học sĩ
大宗主=đại tông chủ
大官人=đại quan nhân
大将军=đại tướng quân
大少爷=đại thiếu gia
大局长=đại cục trưởng
大护法=đại hộ pháp
大探花=đại thám hoa
大老板=đại lão bản
大长老=đại trưởng lão
大门派=đại môn phái
大队长=đại đội trưởng
大院长=đại viện trưởng
大魔王=đại ma vương
委员长=ủy viên trưởng
小兄弟=tiểu huynh đệ
小同志=tiểu đồng chí
小妹妹=tiểu muội muội
小师妹=tiểu sư muội
小施主=tiểu thí chủ
小王爷=tiểu vương gia
少奶奶=thiếu phu nhân
总指挥=tổng chỉ huy
总经理=tổng giám đốc
总镖头=tổng tiêu đầu
护士长=y tá trưởng
检察官=kiểm sát viên
检察长=viện trưởng viện kiểm sát
监察使=giám sát sứ
监狱长=giám ngục trưởng
老先生=lão tiên sinh
老前辈=lão tiền bối
老太太=lão thái thái
老太爷=lão thái gia
老夫人=lão phu nhân
老夫子=lão phu tử
老奶奶=bà cụ
老妈子=bà vú
老将军=lão tướng quân
老帮主=lão bang chủ
老施主=lão thí chủ
老爷子=lão gia tử
老财主=lão địa chủ
七爷=thất gia
三爷=tam gia
上将=thượng tướng
上校=thượng tá
专员=chuyên viên
专家=chuyên gia
世伯=thế bá
世兄=thế huynh
世叔=thế thúc
世子=thế tử
世家=thế gia
中将=trung tướng
中校=trung tá
主任=chủ nhiệm
主席=chủ tịch
主播=chủ bá (streamer)
主管=chủ quản
九爷=cửu gia
书记=bí thư
二少=nhị thiếu
二爷=nhị gia
五爷=ngũ gia
亲王=thân vương
仙姑=tiên cô
仙师=tiên sư
会长=hội trưởng
伯伯=bác
伯母=bác gái
伯父=bác trai
侍卫=thị vệ
元帅=nguyên soái
兄台=huynh đài
先生=tiên sinh
八爷=bát gia
公主=công chúa
公公=công công
公司=công ty
公国=công quốc
公爵=công tước
六爷=lục gia
军师=quân sư
军长=quân đoàn trưởng
别墅=biệt thự
刺使=thứ sử
前輩=tiền bối
前辈=tiền bối
副帅=phó soái
副总=phó tổng
助理=trợ lý
区长=chủ tịch quận
医师=y sư
千户=thiên hộ
厂长=xưởng trưởng
厅长=giám đốc sở
县丞=huyện thừa
县令=huyện lệnh
县长=huyện trưởng
叔叔=chú
司令=tư lệnh
司长=vụ trưởng
同志=đồng chí
同知=đồng tri
员外=viên ngoại
和尚=hòa thượng
四爷=tứ gia
团长=trưởng đoàn
国公=quốc công
场主=tràng chủ
坛主=đàn chủ
堂主=đường chủ
壮士=tráng sĩ
处长=trưởng phòng
大人=đại nhân
大仙=đại tiên
大伯=bác cả
大使=đại sứ
大侠=đại hiệp
大兄=đại huynh
大厨=đầu bếp trưởng
大叔=chú
大夫=đại phu
大妹=đại muội
大姐=đại tỷ
大娘=bác gái
大婶=thím
大官=quan lớn
大少=đại thiếu
大帅=đại soái
大师=đại sư
大帝=đại đế
大郎=đại lang
天神=thiên thần
太仆=thái bộc
太公=thái công
太叔=thái thúc
太君=thái quân
太太=thái thái
太师=thái sư
太监=thái giám
女侠=nữ hiệp
女士=bà/cô
奶奶=bà nội
妈妈=mẹ
妹子=cô em
姑姑=cô
姑娘=cô nương
姥姥=bà ngoại
姨太=di thái
姨娘=di nương
娘娘=nương nương
婆婆=mẹ chồng/bà
婆子=bà già
媒婆=bà mối
嬷嬷=ma ma
学府=học phủ
学长=đàn anh
宗师=tông sư
宫主=cung chủ
宫女=cung nữ
家主=gia chủ
家人=người nhà
家莊=gia trang
寡妇=quả phụ
寨主=trại chủ
导演=đạo diễn
将军=tướng quân
尊者=tôn giả
小三=tiểu tam (kẻ thứ ba)
小侄=tiểu điệt
小侠=tiểu hiệp
小兄=tiểu huynh
小哥=anh bạn nhỏ
小妞=cô em
小妹=tiểu muội
小弟=tiểu đệ
小鬼=tiểu quỷ
少主=thiếu chủ
少侠=thiếu hiệp
少将=thiếu tướng
少校=thiếu tá
少董=thiếu đổng
尚書=thượng thư
局长=cục trưởng
居士=cư sĩ
山庄=sơn trang
巡察=tuần sát
工头=đốc công
左使=tả sứ
市长=thị trưởng
师侄=sư điệt
师傅=sư phụ
师哥=sư ca
师姑=sư cô
师爷=sư gia
师长=sư trưởng
帝君=đế quân
帝国=đế quốc
帮主=bang chủ
干部=cán bộ
庄主=trang chủ
府尹=phủ doãn
弟妹=em dâu
御佐=ngự tá
御史=ngự sử
御圆=ngự viên
忤作=ngỗ tác
总监=tổng giám
总管=tổng quản
愛卿=ái khanh
所长=viện trưởng/trưởng đồn
执事=chấp sự
护卫=hộ vệ
护士=y tá
捕头=bộ đầu
捕快=bộ khoái
掌教=chưởng giáo
掌柜=chưởng quầy
掌門=chưởng môn
探花=thám hoa
政委=chính ủy
教员=giáo viên
教官=giáo quan
教授=giáo sư
教练=huấn luyện viên
族人=tộc nhân
族长=tộc trưởng
曾祖=tằng tổ
机长=cơ trưởng
校尉=hiệu úy
校草=hotboy trường
校长=hiệu trưởng
楼主=lâu chủ
爵爷=tước gia
父子=cha con
爷爷=ông nội
爸爸=bố
特助=trợ lý đặc biệt
状元=trạng nguyên
王国=vương quốc
王子=hoàng tử
王爷=vương gia
班长=lớp trưởng
當家=đương gia
皇后=hoàng hậu
皇子=hoàng tử
盟主=minh chủ
相公=tướng công
相爷=tướng gia
省长=tỉnh trưởng
真人=chân nhân
真君=chân quân
知县=tri huyện
知府=tri phủ
社长=giám đốc/chủ nhiệm CLB
神医=thần y
秀才=tú tài
科长=trưởng khoa
秘书=thư ký
管事=quản sự
管家=quản gia
總督=tổng đốc
组长=tổ trưởng
统领=thống lĩnh
编剧=biên kịch
美人=mỹ nhân
美女=người đẹp
老七=lão thất
老三=lão tam
老九=lão cửu
老二=lão nhị
老五=lão ngũ
老人=người già
老儿=lão nhi
老兄=lão huynh
老八=lão bát
老六=lão lục
老哥=lão ca
老四=lão tứ
老大=đại ca
老太=lão thái
老头=lão già
老娘=bà đây (xưng hô)
老師=thầy giáo
老弟=lão đệ
老怪=lão quái
老本=vốn liếng
老板=ông chủ
老汉=lão hán
老爷=lão gia
老祖=lão tổ
老者=lão giả
老道=lão đạo
老鬼=lão quỷ
舅哥=anh vợ
药师=dược sư
营长=tiểu đoàn trưởng
董事=ủy viên hội đồng quản trị
表哥=biểu ca
表妹=biểu muội
表姐=biểu tỷ
表弟=biểu đệ
警官=cảnh sát
议员=nghị viên
记者=phóng viên
讲师=giảng viên
賢侄=hiền điệt
賢弟=hiền đệ
贵人=quý nhân
贵妃=quý phi
道人=đạo nhân
道兄=đạo huynh
道士=đạo sĩ
郎中=lang trung
部长=bộ trưởng
酒店=khách sạn
酒馆=tửu quán
铁匠=thợ rèn
镇督=trấn đốc
镇长=thị trưởng
镖局=tiêu cục
長老=trưởng lão
长官=trưởng quan
门主=môn chủ
队长=đội trưởng
阿姨=dì
院长=viện trưởng
集团=tập đoàn
青年=thanh niên
顾问=cố vấn
馆主=quán chủ
首长=thủ trưởng
香主=hương chủ
马头=mã đầu
伯=bác
侄=cháu
儿=con
兄=anh
卿=khanh
叔=chú
哥=anh
妈=mẹ
妹=em gái
姆=bảo mẫu
姊=chị
姐=chị
姨=dì
娘=mẹ/nương
婶=thím
嫂=chị dâu
导=đạo
局=cục
弟=em trai
总=tổng
某=mỗ
母=mẹ
父=cha
爷=ông/gia
爸=bố
王=vương
皇=hoàng
老=lão
舅=cậu
董=đổng
媳妇儿=vợ
人=người
女神=nữ thần
局长=cục trưởng
老奶奶=bà cụ
大厨=đầu bếp
警官=cảnh sát
监狱=nhà tù
所长=trưởng đồn
同学=bạn học
科长=trưởng khoa
少=thiếu
氏=thị
宅=nhà/phủ
懂=hiểu
府=phủ
厅长=giám đốc sở
市=thành phố
镇=thị trấn
县=huyện
司=ty
国=nước
國=quốc
園=viên
城=thành
堂=đường
大学=đại học
大學=đại học
宗=tông
宫=cung
宮=cung
寺=chùa
居=nhà
山=núi
屿=đảo nhỏ
崖=vách núi
嶼=đảo
州=châu
平原=bình nguyên
庄=trang
店=cửa hàng
庵=am
楼=lầu
樓=lầu
殿=điện
河=sông
派=phái
經=kinh
縣=huyện
经=kinh
莊=trang
谷=cốc
鎮=trấn
門=cửa/môn
閣=các
關=quan
门=môn
阁=các
館=quán
馆=quán
村=thôn/làng
家庄=gia trang
家族=gia tộc
家村=gia thôn
剑派=kiếm phái
家=nhà/gia
积长=tích trưởng
省=tỉnh
泽=đầm
洞=động
京=kinh
朝=triều
讲师=giảng viên
郡=quận
院=viện
坊=phường
区=khu
帮=bang
甸=điện
执事=chấp sự
小儿=con trai
副主编=phó tổng biên tập
副台长=phó giám đốc đài
副总兵=phó tổng binh
副总监=phó tổng giám đốc
副总督=phó tổng đốc
副楼主=phó lâu chủ
副狱长=phó giám ngục
副班长=phó lớp trưởng
副署长=phó cục trưởng
副阁主=phó các chủ
团支书=bí thư chi đoàn
国舅爷=quốc cữu gia
士官长=sĩ quan trưởng
大主播=streamer nổi tiếng
大主教=đại giám mục
太奶奶=cụ bà
太子妃=thái tử phi
太师叔=thái sư thúc
太掌门=thái chưởng môn
太爷爷=cụ ông
尚书令=thượng thư lệnh
左侍郎=tả thị lang
师团长=sư đoàn trưởng
总堂主=tổng đường chủ
总导演=tổng đạo diễn
总局长=tổng cục trưởng
总管事=tổng quản sự
总编辑=tổng biên tập
指导员=chính trị viên
指挥使=chỉ huy sứ
旅团长=lữ đoàn trưởng
副主=phó chủ
副使=phó sứ
堂叔=chú họ
堂姑=cô họ
堂嫂=chị dâu họ
太妃=thái phi
太傅=thái phó
太医=thái y
太史=thái sử
太后=thái hậu
太子=thái tử
太尉=thái úy
学妹=đàn em
学姐=đàn chị
学弟=đàn em
学神=học thần
宰相=tể tướng
少卿=thiếu khanh
少尉=thiếu úy
少帅=thiếu soái
尚书=thượng thư
州长=thống đốc bang
巡捕=tuần bổ
巡査=tuần cảnh
左相=tả tướng
师伯=sư bá
师姊=sư tỷ
师母=sư mẫu
帝尊=đế tôn
帝师=đế sư
府丞=phủ thừa
府主=phủ chủ
府曹=phủ tào
影后=ảnh hậu
影帝=ảnh đế
徒儿=đồ nhi
御主=ngự chủ
总理=thủ tướng
总编=tổng biên
总长=tổng trưởng
提督=đề đốc
教士=giáo sĩ
教宗=giáo hoàng
教母=mẹ đỡ đầu
相父=tướng phụ
老伯=lão bá
帝=đế
神=thần
郎=lang
上主=thượng chủ
上仙=thượng tiên
上官=thượng quan
上尉=thượng úy
世侄=thế điệt
丞相=thừa tướng
中尉=trung úy
国君=quốc quân
国士=quốc sĩ
国师=quốc sư
国王=quốc vương
国相=quốc tướng
圣主=thánh chủ
圣君=thánh quân
圣尊=thánh tôn
老爹=bố
叔公=ông chú
婶子=thím
干事=cán sự
小伙纸=chàng trai
小助理=trợ lý nhỏ
小医仙=tiểu y tiên
小可爱=bé đáng yêu
小天后=tiểu thiên hậu
小天王=tiểu thiên vương
小太妹=nữ quái
小夫人=tiểu phu nhân
小妖孽=tiểu yêu nghiệt
小姐儿=tiểu thư
小姐妹=chị em
小姑凉=cô nương
小学弟=đàn em
小小姐=tiểu tiểu thư
小崽儿=nhóc con
小帅哥=trai đẹp
小师侄=tiểu sư điệt
小师姐=tiểu sư tỷ
小师弟=tiểu sư đệ
小弟子=tiểu đệ tử
小戏骨=tiểu hý cốt
小明星=ngôi sao nhỏ
小朋友=bạn nhỏ
小毛孩=nhóc con
小白脸=tiểu bạch kiểm
小盆友=bạn nhỏ
小童儿=tiểu đồng
小编剧=biên kịch nhỏ
小编辑=biên tập nhỏ
小贱人=tiểu tiện nhân
小迷弟=fan nam
小队长=tiểu đội trưởng
小鬼子=giặc lùn
小魔仙=tiểu ma tiên
小魔头=tiểu ma đầu
少主人=thiếu chủ nhân
少城主=thiếu thành chủ
少夫人=thiếu phu nhân
少宗主=thiếu tông chủ
少庄主=thiếu trang chủ
少教主=thiếu giáo chủ
少谷主=thiếu cốc chủ
少镖主=thiếu tiêu chủ
少阁主=thiếu các chủ
尚方令=thượng phương lệnh
巡查長=tuần tra trưởng
左仆射=tả bộc xạ
帅大叔=ông chú đẹp trai
师叔祖=sư thúc tổ
异变者=dị biến giả
异能者=dị năng giả
弟弟们=các em trai
御兽师=ngự thú sư
御神子=ngự thần tử
总书记=tổng bí thư
打渔佬=ngư dân
执刑官=chấp hình quan
执政官=chấp chính quan
执法官=chấp pháp quan
护国公=hộ quốc công
护林员=kiểm lâm
指挥员=chỉ huy viên
摄政公=nhiếp chính công
摄政王=nhiếp chính vương
支行长=giám đốc chi nhánh
支队长=chi đội trưởng
旅行家=nhà lữ hành
曾奶奶=cụ bà
曾爷爷=cụ ông
有产者=người có tài sản
本大爷=bản đại gia
本总裁=bản tổng tài
清洁工=lao công
演奏人=người biểu diễn
演讲家=nhà diễn thuyết
特效师=kỹ sư hiệu ứng
状元公=trạng nguyên
状元郎=trạng nguyên lang
狗奴才=cẩu nô tài
狗杂种=tạp chủng
王世子=vương thế tử
王太后=vương thái hậu
王太子=vương thái tử
瓜娃子=đứa ngốc
男配角=nam phụ
皇四代=hoàng tứ đại
皇太女=hoàng thái nữ
皇太孙=hoàng thái tôn
皇太弟=hoàng thái đệ
皇祖父=hoàng tổ phụ
皇贵妃=hoàng quý phi
皇长子=hoàng trưởng tử
监查使=giám tra sứ
相谈役=người đàm phán
看守长=trưởng cai ngục
真君子=chân quân tử
研修生=nghiên cứu sinh
科学家=nhà khoa học
秘书长=tổng thư ký
籽苯家=tư bản
精灵王=tinh linh vương
老人家=cụ già
老佛子=lão phật tử
老侯爷=lão hầu gia
老兄弟=lão huynh đệ
老同学=bạn học cũ
老和尚=lão hòa thượng
老太公=lão thái công
老头子=lão già
老妖婆=lão yêu bà
老妖孽=lão yêu nghiệt
老妖怪=lão yêu quái
老妹儿=bà em
老学究=lão học giả
老宗主=lão tông chủ
老家主=lão gia chủ
老寨主=lão trại chủ
老尼姑=lão ni cô
老座主=lão tọa chủ
老戏骨=lão hý cốt
老教授=lão giáo sư
老方丈=lão phương trượng
老族长=lão tộc trưởng
老杂役=lão tạp dịch
老毕登=lão già (Biden)
老淫贼=lão dâm tặc
老王八=lão rùa già
老班长=lớp trưởng cũ
老真人=lão chân nhân
老神仙=lão thần tiên
老色胚=lão sắc lang
老色鬼=lão sắc quỷ
老英雄=lão anh hùng
老观主=lão quán chủ
老连长=lão đại đội trưởng
老道士=lão đạo sĩ
老银币=lão âm hiểm
老顽童=lão ngoan đồng
老魔王=lão ma vương
苦修士=khổ tu sĩ
表舅子=anh vợ họ
裁判员=trọng tài
警部补=trợ lý thanh tra
贵公司=quý công ty
贵夫人=quý phu nhân
贵宗门=quý tông môn
郎中令=lang trung lệnh
郡守府=quận thủ phủ
都御史=đô ngự sử
镇抚使=trấn phủ sứ
长公子=trưởng công tử
长弓手=trường cung thủ
阔太太=phu nhân nhà giàu
阵法师=trận pháp sư
除灵师=trừ linh sư
雌小鬼=nhãi ranh
雕塑师=nhà điêu khắc
驸马爷=phò mã
骑士长=kỵ sĩ trưởng
骷髅兵=lính xương
魔导士=ma đạo sĩ
魔术师=ảo thuật gia
魔法师=pháp sư
七哥=thất ca
三哥=tam ca
三姐=tam tỷ
三娘=tam nương
三少=tam thiếu
主唱=hát chính
主子=chủ nhân
主教=giám mục
主祭=chủ tế
主簿=chủ bạ
主薄=chủ bạ
义妹=nghĩa muội
义弟=nghĩa đệ
乡长=xã trưởng
二伯=bác hai
二叔=chú hai
二哥=nhị ca
二妹=nhị muội
二娘=nhị nương
二嫂=nhị tẩu
二郎=nhị lang
人臣=bề tôi
仙人=tiên nhân
仙友=tiên hữu
仙女=tiên nữ
仙长=tiên trưởng
令兄=lệnh huynh
令媛=lệnh ái
仲父=trọng phụ
会元=hội nguyên
伪帝=ngụy đế
伯爵=bá tước
伴读=thư đồng
佛子=phật tử
作家=nhà văn
使徒=sứ đồ
使者=sứ giả
使魔=sứ ma
侍中=thị trung
侍臣=thị thần
侍郎=thị lang
侦探=thám tử
侯爵=hầu tước
俊男=trai đẹp
信友=bạn qua thư
信徒=tín đồ
修士=tu sĩ
元老=nguyên lão
先儒=tiên nho
先帝=tiên đế
公侯=công hầu
六弟=lục đệ
养女=con nuôi
兽娘=thú nương
内侍=nội thị
军爷=quân gia
军神=quân thần
军骑=quân kỵ
准将=chuẩn tướng
准尉=chuẩn úy
刀匠=thợ rèn đao
剑仙=kiếm tiên
剑圣=kiếm thánh
剑尊=kiếm tôn
剑豪=kiếm hào
剑霸=kiếm bá
副厅=phó giám đốc sở
副捕=phó bộ đầu
副掌=phó bộ trưởng
副部=phó bộ trưởng
功曹=công tào
勇士=dũng sĩ
勇者=dũng giả
勋爵=huân tước
勐将=mãnh tướng
匠师=thợ thủ công
医仙=y tiên
医官=y quan
千金=thiên kim
卫尉=vệ úy
卷王=vua cày cuốc
卿家=khanh gia
厂公=xưởng công
原身=nguyên thân
县主=huyện chủ
县吏=huyện lại
县尊=huyện tôn
参军=tham quân
参将=tham tướng
参谋=tham mưu
叔父=thúc phụ
右相=hữu tướng
司主=ti chủ
司祭=tư tế
司铎=linh mục
名儒=danh nho
名导=đạo diễn nổi tiếng
名帅=danh soái
名师=danh sư
名旦=danh đán
后者=người sau
后辈=hậu bối
哥儿=anh bạn
四妹=tứ muội
四娘=tứ nương
圣座=thánh tọa
域主=vực chủ
堂哥=anh họ
堡主=bảo chủ
境主=cảnh chủ
外公=ông ngoại
大伴=đại bạn
大佬=đại lão
大儒=đại nho
大公=đại công tước
大匠=đại tượng
大圣=đại thánh
大士=đại sĩ
大姊=đại tỷ
大姑=cô cả
大将=đại tướng
大巫=đại vu
大校=đại tá
大汗=đại hãn
大父=ông nội
大牛=cao thủ
大神=đại thần
大老=đại lão
大臣=đại thần
大花=đại hoa
大魔=đại ma
天王=thiên vương
天骄=thiên kiêu
天魔=thiên ma
太上=thái thượng
太保=thái bảo
太婆=cụ bà
夫子=phu tử
夫郎=phu lang
头儿=sếp
头头=thủ lĩnh
女帝=nữ đế
女忧=nữ diễn viên
女爵=nữ tước
女王=nữ vương
女警=nữ cảnh sát
女贼=nữ tặc
女郎=cô gái
奴婢=nô tỳ
奸相=gian tướng
妃子=phi tử
妖僧=yêu tăng
妖圣=yêu thánh
妖女=yêu nữ
妖妃=yêu phi
妖王=yêu vương
妖皇=yêu hoàng
妹儿=em gái
妹纸=em gái
妾身=thiếp
姊夫=anh rể
姐妹=chị em
姨婆=bà dì
婆娘=vợ
婶婶=thím
婿子=con rể
嫂子=chị dâu
嬢嬢=cô/dì
子爵=tử tước
孙儿=cháu trai
孙女=cháu gái
学园=học viện
学士=học sĩ
学霸=học bá
孽徒=nghiệt đồ
守令=thủ lệnh
官爷=quan gia
宝宝=bảo bảo/bé cưng
宫相=cung tướng
家冲=gia xung
家妹=em gái tôi
宿友=bạn cùng phòng
导师=người hướng dẫn
封君=phong quân
将佐=tướng tá
尊上=tôn thượng
小主=tiểu chủ
小侯=tiểu hầu
小奴=tiểu nô
小姨=dì nhỏ
小徒=đồ đệ nhỏ
小王=tiểu vương
屠户=đồ tể
山长=sơn trưởng
岛主=đảo chủ
岳母=mẹ vợ
崽种=tạp chủng
巨神=cự thần
巫女=vu nữ
巫王=vu vương
帅哥=trai đẹp
年兄=niên huynh
幼主=ấu chúa
店员=nhân viên
店长=cửa hàng trưởng
座主=tọa chủ
式神=thức thần
弟子=đệ tử
当家=đương gia
怪人=quái nhân
总兵=tổng binh
总工=tổng công trình sư
恩主=ân chủ
恶僧=ác tăng
恶少=ác thiếu
战神=chiến thần
房主=chủ nhà
指挥=chỉ huy
捕手=cầu thủ bắt bóng
排长=trung đội trưởng
探员=đặc vụ
推官=thôi quan
掾史=duyện sử
教父=bố già
教皇=giáo hoàng
教祖=giáo tổ
散人=tán nhân
散仙=tán tiên
方丈=phương trượng
族叔=chú họ
族老=tộc lão
昏君=hôn quân
星主=tinh chủ
朋友=bạn bè
本帝=bản đế
术师=thuật sư
村姑=thôn cô
村正=thôn chính
村长=trưởng thôn
柜员=nhân viên
树妖=thụ yêu
校生=học sinh
校花=hoa khôi
校董=uỷ viên hội đồng trường
格格=cách cách
棋圣=kỳ thánh
次女=con gái thứ
次辅=thứ phụ
次长=thứ trưởng
歌王=ca vương
歌神=ca thần
步卒=lính bộ binh
武替=đóng thế võ thuật
母亲=mẹ
母妃=mẫu phi
母神=mẫu thần
毒妇=độc phụ
汝等=các ngươi
法圣=pháp thánh
法官=thẩm phán
法师=pháp sư
法爷=pháp gia
洞主=động chủ
爱豆=idol
爱郎=người yêu
爵士=tước sĩ
父亲=cha
爸爸=bố
牧首=thượng phụ
特使=đặc sứ
状师=trạng sư
犹女=cháu gái
犹子=cháu trai
狱长=giám ngục
猎手=thợ săn
王上=vương thượng
王储=vương trữ
王后=vương hậu
王夫=vương phu
王女=vương nữ
王妃=vương phi
王弟=vương đệ
王朝=vương triều
班花=hoa khôi lớp
班草=hotboy lớp
男侍=hầu nam
男士=quý ông
男巫=phù thủy nam
男爵=nam tước
百户=bách hộ
皇储=hoàng trữ
皇女=hoàng nữ
皇妹=hoàng muội
皇姐=hoàng tỷ
皇嫂=hoàng tẩu
皇帝=hoàng đế
盆友=bạn bè
监僧=giám tăng
监军=giám quân
监国=giám quốc
监院=giám viện
直女=gái thẳng
看官=khán giả
真传=chân truyền
督主=đốc chủ
督察=thanh tra
矿主=chủ mỏ
祖师=tổ sư
祝师=chúc sư
神主=thần chủ
神使=thần sứ
神僧=thần tăng
神官=thần quan
神将=thần tướng
神父=cha xứ
神眷=thần quyến
神豪=thần hào
神选=thần tuyển
祭司=tế tư
祭酒=tế tửu
禅师=thiền sư
科员=nhân viên
站长=trạm trưởng
童儿=tiểu đồng
童鞋=bạn học
系花=hoa khôi khoa
系草=hotboy khoa
系长=trưởng khoa
线长=trưởng chuyền
经师=kinh sư
统将=thống tướng
继母=mẹ kế
网红=hot mạng
署长=cục trưởng
群主=trưởng nhóm
老仙=lão tiên
老公=chồng
老妹=em gái
老姐=chị gái
老婆=vợ
老狗=lão chó
老猪=lão heo
老贼=lão tặc
股长=trưởng phòng
胖哥=anh béo
舅舅=cậu
舵主=đà chủ
船副=thuyền phó
船长=thuyền trưởng
艇长=thuyền trưởng
良婿=con rể tốt
花旦=hoa đán
花魁=hoa khôi
菩萨=Bồ Tát
虫王=trùng vương
虫皇=trùng hoàng
蛊师=cổ sư
行长=giám đốc ngân hàng
观主=quán chủ
警司=cảnh ty
警督=cảnh đốc
警视=cảnh thị
警部=thanh tra
责编=biên tập viên
贤人=hiền nhân
贤君=hiền quân
贤者=hiền giả
贪官=tham quan
贵师=quý sư
贵校=quý trường
辅臣=phụ thần
连长=đại đội trưởng
选侯=tuyển hầu
选手=tuyển thủ
道子=đạo tử
道尊=đạo tôn
道爷=đạo gia
郎官=quan lang
郡主=quận chúa
郡侯=quận hầu
郡公=quận công
郡守=quận thủ
郡马=quận mã
都督=đô đốc
都统=đô thống
金仙=kim tiên
镖头=tiêu đầu
长史=trưởng sử
长吏=trưởng lại
长妹=em gái cả
长媳=dâu trưởng
长嫂=chị dâu cả
长子=con trai trưởng
阁老=các lão
阔佬=nhà giàu
阙主=khuyết chủ
阿姊=chị
阿父=cha
院主=viện chủ
院士=viện sĩ
院生=viện sinh
隐者=ẩn sĩ
霸主=bá chủ
霸王=bá vương
领事=lãnh sự
首座=thủ tọa
首相=thủ tướng
首辅=thủ phụ
首领=thủ lĩnh
驸马=phò mã
骑士=kỵ sĩ
高僧=cao tăng
鬼王=quỷ vương
魔头=ma đầu
魔女=ma nữ
魔姬=ma cơ
魔将=ma tướng
魔王=ma vương
婿=con rể
阿母=mẹ
阿姆=bảo mẫu
DM=DM
mm=mm
PD=PD
大俠=đại hiệp
大媽=bác gái
大帥=đại soái
大爺=đại gia
太醫=thái y
女俠=nữ hiệp
嬤嬤=ma ma
丫頭=nha đầu
仙君=tiên quân
侍衛=thị vệ
元帥=nguyên soái
兄臺=huynh đài
千戶=thiên hộ
千總=thiên tổng
宮女=cung nữ
少爺=thiếu gia
市長=thị trưởng
師爺=sư gia
師祖=sư tổ
幫主=bang chủ
捕頭=bộ đầu
爺爺=ông nội
狀元=trạng nguyên
王爺=vương gia
田制=chế độ ruộng đất
神醫=thần y
統領=thống lĩnh
縣令=huyện lệnh
總管=tổng quản
老兒=lão儿
老爺=lão gia
老頭=lão đầu
莊主=trang chủ
護法=hộ pháp
貴妃=quý phi
軍師=quân sư
道長=đạo trưởng
部長=bộ trưởng
醫生=bác sĩ
同學=bạn học

# --- CÁC ĐƠN VỊ ---
vạn=vạn
ức=ức
triệu=triệu
ngàn=ngàn
km=km
kg=kg
m=m
cm=cm
`;

// Định nghĩa giới hạn (Ước lượng theo Free Tier của Google AI Studio)
export const MODEL_CONFIGS: ModelQuota[] = [
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3.0 Pro (Mới nhất)',
    rpmLimit: 2,
    rpdLimit: 50,
    priority: 1,
    maxOutputTokens: 65536
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3.0 Flash (Nhanh/Thông minh)',
    rpmLimit: 15,
    rpdLimit: 100, // Estimate
    priority: 2,
    maxOutputTokens: 65536
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash (Dự phòng/Sửa Raw)',
    rpmLimit: 15,
    rpdLimit: 100,
    priority: 3,
    maxOutputTokens: 65536
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite (Siêu nhẹ)',
    rpmLimit: 30,
    rpdLimit: 200,
    priority: 4,
    maxOutputTokens: 65536
  }
];

export const AVAILABLE_LANGUAGES = [
  'Convert thô', 
  'Tiếng Trung', 
  'Tiếng Anh', 
  'Tiếng Hàn', 
  'Tiếng Nhật'
];

export const AVAILABLE_GENRES = [
  'Tiên Hiệp', 'Huyền Huyễn', 'Đô Thị', 'Khoa Huyễn', 'Võng Du',
  'Đồng Nhân', 'Kiếm Hiệp', 'Ngôn Tình', 'Dị Giới', 'Mạt Thế',
  'Ngự Thú', 'Linh Dị', 'Hệ Thống', 'Xuyên Nhanh', 'Hài Hước'
];

export const AVAILABLE_PERSONALITIES = [
  'Vô sỉ/Cợt nhả', 'Lạnh lùng/Sát phạt', 'Cẩn trọng/Vững vàng', 
  'Thông minh/Đa mưu', 'Nhiệt huyết/Trẻ trâu', 'Trầm ổn/Già dặn',
  'Hài hước/Bựa', 'Tàn nhẫn/Hắc ám', 'Chính nghĩa/Thánh mẫu'
];

export const AVAILABLE_SETTINGS = [
  'Trung Cổ/Cổ Đại', 'Hiện đại/Đô thị', 'Tương lai/Sci-fi', 
  'Mạt thế/Zombie', 'Hồng Hoang/Thần Thoại', 'Võng Du/Game', 
  'Phương Tây/Magic', 'Thanh Xuân/Vườn Trường', 'Showbiz/Giải Trí'
];

export const AVAILABLE_FLOWS = [
  'Phàm nhân lưu', 'Vô địch lưu', 'Phế vật lưu', 
  'Hệ thống lưu', 'Xuyên không lưu', 'Trọng sinh lưu', 
  'Điền văn lưu', 'Vô hạn lưu', 'G苟 Đạo (Cẩu đạo)'
];