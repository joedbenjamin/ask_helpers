import * as Alexa from 'ask-sdk-core';
import {
  InputUtil,
  ControlHandler,
  ControlManager,
  Control,
  ContainerControl,
  LiteralContentAct,
  ControlInput,
  ControlResultBuilder,
} from 'ask-sdk-controls';

abstract class LiteralContentControl extends Control {
  constructor(public literalContent: any, public endSession: boolean) {
    super(new.target.name);
    this.literalContent = literalContent;
    this.endSession = endSession;
  }
  handle(_: ControlInput, resultBuilder: ControlResultBuilder) {
    if (this.literalContent)
      resultBuilder.addAct(
        new LiteralContentAct(this, { promptFragment: this.literalContent })
      );
    if (this.endSession) resultBuilder.endSession();
  }
  takeInitiative(
    _: ControlInput,
    __: ControlResultBuilder
  ): void | Promise<void> {}
  canTakeInitiative() {
    return false;
  }
}

class LauncRequestControl extends LiteralContentControl {
  canHandle(input: ControlInput) {
    return InputUtil.isLaunchRequest(input);
  }
}

class StopOrCancelIntentControl extends LiteralContentControl {
  canHandle(input: ControlInput) {
    return (
      InputUtil.isIntent(input, 'AMAZON.StopIntent') ||
      InputUtil.isIntent(input, 'AMAZON.CancelIntent')
    );
  }
}

class SessionEndedRequestControl extends LiteralContentControl {
  canHandle(input: ControlInput) {
    return InputUtil.isSessionEndedRequest(input);
  }
}

class HelloControl extends ContainerControl {
  constructor(props: any) {
    super(props);
    this.addChild(
      new LauncRequestControl("what's up? can I help you today?", false)
    )
      .addChild(
        new StopOrCancelIntentControl(
          "I guess you don't want to talk anymore",
          true
        )
      )
      .addChild(new SessionEndedRequestControl('have a good day', false));
  }
}

class HelloManager extends ControlManager {
  createControlTree() {
    return new HelloControl({ id: 'HelloControl' });
  }
}

const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(new ControlHandler(new HelloManager()))
  .lambda();

export { handler, HelloManager };
