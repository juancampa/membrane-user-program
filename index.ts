import { root, nodes, state } from "membrane";
const { sys_user } = nodes;
const { sms, email } = sys_user;

export const Root = {
  sms: () => ({}),
  email: () => ({}),
};

export const Sms = {
  configure: async ({ args }) =>
    await sys_user.configureSms({ ...args }).$invoke(),
  handleSms: async ({ args: { message } }) => {
    if (state.resolveSmsQuestion) {
      state.resolveSmsQuestion(message);
    }
    await root.sms.received.$emit({ message });
  },
  send: async ({ self, args }) => {
    await sms.tell({ ...args }).$invoke();
  },
};

export const Email = {
  configure: async ({ args }) =>
    await sys_user.configureEmail({ ...args }).$invoke(),
  handleEmail: async ({ args: { message } }) =>
    await root.email.received.$emit({ message }),
};

export const Channel = {
  tell: async ({ self, args }) => {
    if (self.$matchesExact(root.sms.channel)) {
      await sms.tell({ ...args }).$invoke();
    } else {
      await email.tell({ ...args }).$invoke();
    }
  },
  ask: async ({ self, args }) => {
    if (self.$matchesExact(root.sms.channel)) {
      await sms.tell({ message: args.question }).$invoke();
      const response = await new Promise((resolve) => {
        state.resolveSmsQuestion = resolve;
      });
      return response;
    } else {
      throw new Error("Email ask not supported yet");
    }
  },
};

