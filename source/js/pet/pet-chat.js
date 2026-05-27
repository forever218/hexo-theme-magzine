/**
 * ============================================
 * 模块7: 角色聊天气泡 (pet-chat.js)
 * ============================================
 */
/**
 * ============================================
 * 模块7: 角色聊天气泡 (pet-chat.js)
 * ============================================
 */
import { State } from "./pet-sprite.js";

export class PetChat {
  constructor(bubbleEl, textEl, innerEl) {
    this.bubbleEl = bubbleEl;
    this.textEl = textEl;
    this.innerEl = innerEl;

    this.idleTime = 0;
    this.bubbleTimer = null;
    this.dragSayTimer = null; // ★ 新增：拖拽对话延迟定时器
    this.isSpeaking = false;
    this.lastState = State.IDLE;

    this.dialogues = {
      drag: ["放开我!!!", "救命啊!!!", "我讨厌你~呜呜"],
      click: ["不要老是戳我呀", "真讨厌!", "你又点我了!"],
      rightClick: ["不要右键点我听到没有", "干什么啊"],
      fall: ["哼", "哎呀"],
      idle: [
        "你怎么不理我了",
        "快点和我说话",
        "我好无聊啊",
        "老师我想听歌",
        "我好困啊",
        "可以放首歌吗我想听歌!!!",
        "不要右键戳我",
      ],
    };

    this._bindEvents();
  }

  _bindEvents() {
    // ★ 核心修改：移除原生的 click 监听，防覆盖。左键点击对话全权由状态机触发！

    // 仅保留右键的监听
    this.innerEl.addEventListener("contextmenu", () => {
      this.idleTime = 0;
      this.say(this._random(this.dialogues.rightClick));
    });
  }

  update(dt, currentState) {
    if (this.lastState !== currentState) {
      // 1. 进入拖拽状态：延迟 200ms 触发拖拽对话（防止短按时气泡闪烁冲突）
      if (currentState === State.DRAGGING) {
        this.dragSayTimer = setTimeout(() => {
          this.say(this._random(this.dialogues.drag));
        }, 200);
      }

      // 2. 从拖拽状态离开：判定是点击还是松开
      if (this.lastState === State.DRAGGING) {
        clearTimeout(this.dragSayTimer); // 及时清理拖拽定时器

        if (currentState === State.FALL) {
          // 拖拽后松开 -> 触发掉落对话
          this.say(this._random(this.dialogues.fall));
        } else if (currentState === State.RUNNING) {
          // 短按点击后逃跑 -> 触发点击对话
          this.idleTime = 0;
          this.say(this._random(this.dialogues.click));
        }
      }

      this.lastState = currentState;
    }

    this.idleTime += dt;
    if (this.idleTime >= 60) {
      this.idleTime = 0;
      this.say(this._random(this.dialogues.idle));
    }
  }

  say(text, duration = 3000) {
    if (!this.bubbleEl || !this.textEl) return;

    this.textEl.textContent = text;
    this.bubbleEl.style.display = "block";
    this.bubbleEl.style.opacity = "1";
    this.isSpeaking = true;

    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      this.bubbleEl.style.opacity = "0";
      setTimeout(() => {
        this.bubbleEl.style.display = "none";
        this.isSpeaking = false;
      }, 300);
    }, duration);
  }

  _random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
